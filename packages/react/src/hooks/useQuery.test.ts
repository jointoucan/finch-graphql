import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useQuery } from './useQuery';
import gql from 'graphql-tag';
import { FinchMessageKey } from '@finch-graphql/types';
import { FinchProvider } from './FinchProvider';
import { FinchClient, QueryCache } from '@finch-graphql/client';

const testDoc = gql`
  query foo {
    bar
  }
`;

describe('useQuery', () => {
  beforeEach(() => {
    chrome.runtime.lastError = undefined;
    chrome.runtime.sendMessage = jest.fn();
  });
  it('should send a message to the background', async () => {
    const sendMessageMock = jest
      .fn()
      .mockImplementation((message, callback) => {
        setTimeout(() => {
          callback({ data: { bar: true } });
        }, 0);
      });
    chrome.runtime.sendMessage = sendMessageMock;

    const wrapper = renderHook(() => useQuery(testDoc, {}), {
      wrapper: ({ children }) => {
        return React.createElement(FinchProvider, {
          // @ts-ignore
          children,
          client: new FinchClient({ useMessages: true }),
        });
      },
    });

    await wrapper.waitForNextUpdate();

    expect(sendMessageMock.mock.calls[0][0]).toEqual({
      external: undefined,
      query: testDoc,
      variables: undefined,
      type: FinchMessageKey.Generic,
    });

    expect(wrapper.result.current.data).toEqual({ bar: true });
  });
  it('should return an error if a last error is set', async () => {
    const sendMessageMock = jest
      .fn()
      .mockImplementation((message: unknown, callback) => {
        callback(null);
      });
    chrome.runtime.sendMessage = sendMessageMock;
    chrome.runtime.lastError = new Error('foo');

    const wrapper = renderHook(() => useQuery(testDoc, {}), {
      wrapper: ({ children }) => {
        return React.createElement(FinchProvider, {
          // @ts-ignore
          children,
          client: new FinchClient({ useMessages: true }),
        });
      },
    });

    await wrapper.waitForNextUpdate();

    expect(wrapper.result.current.error?.message).toBe('foo');
  });
  it('refetch should send another message', async () => {
    const sendMessageMock = jest
      .fn()
      .mockImplementation((message, callback) => {
        setTimeout(() => {
          callback({ data: { bar: true } });
        }, 0);
      });
    chrome.runtime.sendMessage = sendMessageMock;

    const wrapper = renderHook(() => useQuery(testDoc, {}), {
      wrapper: ({ children }) => {
        return React.createElement(FinchProvider, {
          // @ts-ignore
          children,
          client: new FinchClient({ useMessages: true }),
        });
      },
    });

    await wrapper.waitForNextUpdate();
    await act(async () => {
      await wrapper.result.current.refetch();
    });

    expect(sendMessageMock).toBeCalledTimes(2);

    expect(sendMessageMock.mock.calls[1][0]).toEqual({
      query: testDoc,
      variables: undefined,
      type: FinchMessageKey.Generic,
      external: undefined,
    });
  });
  it('should clear out any old error values on refetch', async () => {
    const sendMessageMock = jest
      .fn()
      .mockImplementation((message, callback) => {
        setTimeout(() => {
          callback({ errors: [new Error('foo')] });
        }, 0);
      });
    chrome.runtime.sendMessage = sendMessageMock;

    const wrapper = renderHook(() => useQuery(testDoc, {}), {
      wrapper: ({ children }) => {
        return React.createElement(FinchProvider, {
          // @ts-ignore
          children,
          client: new FinchClient({ useMessages: true }),
        });
      },
    });

    await wrapper.waitForNextUpdate();

    // Original error
    expect(wrapper.result.current.error?.message).toBe('foo');

    sendMessageMock.mockReset().mockImplementation((message, callback) => {
      setTimeout(() => {
        callback({ data: { foo: true } });
      }, 0);
    });

    await act(async () => {
      await wrapper.result.current.refetch();
    });

    // Error cache is cleared
    expect(wrapper.result.current.error).toBe(undefined);
  });
  it('wrapping it in a provider should allow for external calls', async () => {
    const sendMessageMock = jest
      .fn()
      .mockImplementation((_, _message, callback) => callback());
    chrome.runtime.sendMessage = sendMessageMock;

    const wrapper = renderHook(() => useQuery(testDoc, {}), {
      wrapper: ({ children }) => {
        return React.createElement(FinchProvider, {
          // @ts-ignore
          children,
          client: new FinchClient({ id: 'foo', useMessages: true }),
        });
      },
    });

    await wrapper.waitForNextUpdate();

    // First param is id on external calls
    expect(sendMessageMock.mock.calls[0][0]).toEqual('foo');
  });
  it('should refetch a query when the variables change', async () => {
    const sendMessageMock = jest
      .fn()
      .mockImplementation((_, _message, callback) => callback());
    chrome.runtime.sendMessage = sendMessageMock;

    const wrapper = renderHook(
      ({ foo }) => useQuery(testDoc, { variables: { foo } }),
      {
        initialProps: {
          foo: 'bar',
        },
        wrapper: ({ children }) => {
          return React.createElement(FinchProvider, {
            // @ts-ignore
            children,
            client: new FinchClient({ id: 'foo', useMessages: true }),
          });
        },
      },
    );

    await wrapper.waitForNextUpdate();

    act(() => {
      wrapper.rerender({ foo: 'baz' });
    });

    await wrapper.waitForNextUpdate();

    expect(sendMessageMock).toBeCalledTimes(2);
  });
  it('should update the cache values when the cache values are updated', async () => {
    const sendMessageMock = jest
      .fn()
      .mockImplementationOnce((_, callback) =>
        callback({ data: { bar: 'baz' } }),
      );
    chrome.runtime.sendMessage = sendMessageMock;

    const client = new FinchClient({
      cache: new QueryCache(),
      useMessages: true,
    });

    const wrapper = renderHook(
      ({ foo }) => useQuery(testDoc, { variables: { foo } }),
      {
        initialProps: {
          foo: 'bar',
        },
        wrapper: ({ children }) => {
          return React.createElement(FinchProvider, {
            // @ts-ignore
            children,
            client,
          });
        },
      },
    );

    await wrapper.waitForNextUpdate();

    // Validate initial data is present
    expect(wrapper.result.current.data).toEqual({ bar: 'baz' });

    act(() => {
      // Change the response
      sendMessageMock.mockImplementationOnce((_, callback) =>
        callback({ data: { bar: 'qux' } }),
      );
      client.query(testDoc, { foo: 'bar' });
    });

    await wrapper.waitForNextUpdate();

    // Validate new value is present
    expect(wrapper.result.current.data).toEqual({ bar: 'qux' });
  });
  it('should call the query multiple times if a pollInterval is passed', async () => {
    const sendMessageMock = jest
      .fn()
      .mockImplementationOnce((_, callback) =>
        callback({ data: { bar: 'baz' } }),
      );
    chrome.runtime.sendMessage = sendMessageMock;

    const client = new FinchClient({
      cache: new QueryCache(),
      useMessages: true,
    });

    const wrapper = renderHook(
      ({ foo }) => useQuery(testDoc, { variables: { foo }, pollInterval: 500 }),
      {
        initialProps: {
          foo: 'bar',
        },
        wrapper: ({ children }) => {
          return React.createElement(FinchProvider, {
            // @ts-ignore
            children,
            client,
          });
        },
      },
    );

    // Validate send message is being called multiple times is called
    await wrapper.waitForNextUpdate();
    expect(sendMessageMock).toBeCalledTimes(1);
    await wrapper.waitForNextUpdate();
    expect(sendMessageMock).toBeCalledTimes(2);
    act(() => {
      wrapper.result.current.stopPolling();
    });
  });
  it('should allow the controlling of polling by the start and stop polling functions', async () => {
    const sendMessageMock = jest
      .fn()
      .mockImplementationOnce((_, callback) =>
        callback({ data: { bar: 'baz' } }),
      );
    chrome.runtime.sendMessage = sendMessageMock;

    const client = new FinchClient({
      cache: new QueryCache(),
      useMessages: true,
    });

    const wrapper = renderHook(
      ({ foo }) =>
        useQuery(testDoc, {
          variables: { foo },
          pollInterval: 500,
          poll: false,
        }),
      {
        initialProps: {
          foo: 'bar',
        },
        wrapper: ({ children }) => {
          return React.createElement(FinchProvider, {
            // @ts-ignore
            children,
            client,
          });
        },
      },
    );
    // Validate send message is being called initially
    await wrapper.waitForNextUpdate();
    expect(sendMessageMock).toBeCalledTimes(1);

    // Start polling
    act(() => {
      wrapper.result.current.startPolling();
    });

    // Validate send message is being called more times after polling has started
    await wrapper.waitFor(() => expect(sendMessageMock).toBeCalledTimes(2));
    await wrapper.waitFor(() => expect(sendMessageMock).toBeCalledTimes(3));

    // Stop polling
    act(() => {
      wrapper.result.current.stopPolling();
    });

    expect(() => expect(sendMessageMock).toBeCalledTimes(4)).toThrow(/3/);
  });
  it.only('should refetch cache when the cache is invalidated', async () => {
    const sendMessageMock = jest
      .fn()
      .mockImplementationOnce((_, callback) =>
        callback({ data: { bar: 'baz' } }),
      );
    chrome.runtime.sendMessage = sendMessageMock;

    const client = new FinchClient({
      cache: new QueryCache(),
      useMessages: true,
    });

    const wrapper = renderHook(
      ({ foo }) =>
        useQuery(testDoc, {
          variables: { foo },
        }),
      {
        initialProps: {
          foo: 'bar',
        },
        wrapper: ({ children }) => {
          return React.createElement(FinchProvider, {
            // @ts-ignore
            children,
            client,
          });
        },
      },
    );

    await wrapper.waitForNextUpdate();
    expect(sendMessageMock).toBeCalledTimes(1);

    expect(wrapper.result.current.data).toEqual({ bar: 'baz' });

    sendMessageMock.mockImplementationOnce((_, callback) =>
      callback({ data: { bar: 'qux' } }),
    );

    act(() => {
      wrapper.result.current.invalidate();
    });

    await wrapper.waitForNextUpdate();

    expect(sendMessageMock).toBeCalledTimes(2);
    expect(wrapper.result.current.data).toEqual({ bar: 'qux' });
  });
});
