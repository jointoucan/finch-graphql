import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import gql from 'graphql-tag';
import { FinchMessageKey } from '../../types';
import { FinchProvider } from './FinchProvider';
import { useMutation } from './useMutation';
import { FinchClient } from '../FinchClient';

const testDoc = gql`
  mutation foo {
    bar
  }
`;

describe('useMutation', () => {
  beforeEach(() => {
    chrome.runtime.lastError = undefined;
    chrome.runtime.sendMessage = jest.fn();
  });
  it('should send a message to the background once called', async () => {
    const sendMessageMock = jest
      .fn()
      .mockImplementation((message, callback) => {
        setTimeout(() => {
          callback({ data: { bar: true } });
        }, 0);
      });
    chrome.runtime.sendMessage = sendMessageMock;

    const wrapper = renderHook(() => useMutation(testDoc));

    await act(async () => {
      await wrapper.result.current[0]({});
    });

    expect(sendMessageMock.mock.calls[0][0]).toEqual({
      query: testDoc,
      variables: {},
      type: FinchMessageKey.Generic,
    });

    expect(wrapper.result.current[1].data).toEqual({ bar: true });
  });
  it('should return an error if a last error is set', async () => {
    const sendMessageMock = jest
      .fn()
      .mockImplementation((message: unknown, callback) => {
        callback(null);
      });
    chrome.runtime.sendMessage = sendMessageMock;
    chrome.runtime.lastError = new Error('foo');

    const wrapper = renderHook(() => useMutation(testDoc));

    await act(async () => {
      await wrapper.result.current[0]({});
    });

    expect(wrapper.result.current[1].error.message).toBe('foo');
  });
  it('wrapping it in a provider should allow for external calls', async () => {
    const sendMessageMock = jest
      .fn()
      .mockImplementation((_, callback) => callback());
    chrome.runtime.sendMessage = sendMessageMock;

    const wrapper = renderHook(() => useMutation(testDoc), {
      wrapper: ({ children }) => {
        return React.createElement(FinchProvider, {
          // @ts-ignore
          children,
          client: new FinchClient({ id: 'foo' }),
        });
      },
    });

    await act(async () => {
      await wrapper.result.current[0]({});
    });

    // First param is id on external calls
    expect(sendMessageMock.mock.calls[0][0]).toEqual('foo');
  });
});
