import { addMessageListener, addExteneralMessageListener } from './browser';

describe('addMessageListener', () => {
  it('should if using the chrome api immediately return true and call sendResponse', () => {
    expect.assertions(3);
    const sendResponseMock = jest.fn();
    const handler = jest.fn().mockImplementation(() => {
      // NOTE: fake promise to avoid async
      return {
        then: send => {
          send({ foo: 'bar' });
        },
      };
    });

    globalThis.chrome = {
      runtime: {
        // @ts-ignore
        onMessage: {
          addListener: jest.fn().mockImplementation(methodToTest => {
            //
            const resp = methodToTest(
              {
                type: 'foo',
                query: '',
                variables: {},
              },
              {},
              sendResponseMock,
            );
            expect(resp).toBe(true);
            expect(handler).toBeCalled();
            expect(sendResponseMock).toBeCalledWith({ foo: 'bar' });
          }),
        },
      },
    };

    addMessageListener(handler, { messageKey: 'foo' });
  });
});

describe('addExteneralMessageListener', () => {
  it('should if using the chrome api immediately return true and call sendResponse', () => {
    expect.assertions(3);
    const sendResponseMock = jest.fn();
    const handler = jest.fn().mockImplementation(() => {
      // NOTE: fake promise to avoid async
      return {
        then: send => {
          send({ foo: 'bar' });
        },
      };
    });

    globalThis.chrome = {
      runtime: {
        // @ts-ignore
        onMessageExternal: {
          addListener: jest.fn().mockImplementation(methodToTest => {
            //
            const resp = methodToTest(
              {
                type: 'foo',
                query: '',
                variables: {},
              },
              {},
              sendResponseMock,
            );
            expect(resp).toBe(true);
            expect(handler).toBeCalled();
            expect(sendResponseMock).toBeCalledWith({ foo: 'bar' });
          }),
        },
      },
    };

    addExteneralMessageListener(handler, { messageKey: 'foo' });
  });
});
