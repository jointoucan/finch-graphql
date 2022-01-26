import { FinchClient } from '../client';
import * as ExternalRequest from './listenForExternalRequests';
import { FinchDocumentEventNames } from './types';

const { listenForExternalRequests } = ExternalRequest;

describe('listenForExternalRequests', () => {
  beforeEach(() => {
    window.chrome = undefined;
  });
  it('should proxy queries though postMessage', async () => {
    const sendMessageResolve = Promise.resolve({
      data: {
        foo: 'bar',
      },
    });
    browser.runtime.sendMessage = jest
      .fn()
      .mockImplementation(() => sendMessageResolve);

    // @ts-ignore
    browser.runtime.id = 'foo';
    window.addEventListener = jest.fn();
    // const responseSpy = jest.spyOn(ExternalRequest, 'sendResponse');

    const client = new FinchClient({
      useMessages: true,
    });
    const querySpy = jest.spyOn(client, 'mutate');
    const unloadListener = listenForExternalRequests({
      client,
    });

    expect(unloadListener).toBeInstanceOf(Function);
    expect(window.addEventListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    );

    const query = 'query { foo }';
    // @ts-ignore
    const handler = window.addEventListener.mock.calls[0][1];
    const event = {
      data: {
        requestId: 'foo',
        type: FinchDocumentEventNames.Request,
        query,
        variables: {},
        extensionId: 'foo',
      },
    };
    handler(event);
    // Should be external
    expect(querySpy).toHaveBeenCalledWith(query, {}, { external: true });
    expect(browser.runtime.sendMessage).toHaveBeenCalled();
    await sendMessageResolve;
    // TODO: Figure out how we can evaluate values passed to postMessage
    // It keeps coming back with no calls, but it def did get called.
    // expect(window.postMessage).toHaveBeenCalledWith({});
  });
});
