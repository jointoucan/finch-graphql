import { FinchConnectionType } from '@finch-graphql/types';

const createListener = () => ({
  addListener: jest.fn(),
  removeListener: jest.fn(),
  hasListener: jest.fn(),
});

globalThis.browser = {
  // @ts-ignore
  runtime: {
    sendMessage: jest.fn(),
    onConnect: createListener(),
    onConnectExternal: createListener(),
    onMessage: createListener(),
    onMessageExternal: createListener(),
  },
};

expect.extend({
  toBeValidConnection(Received: any) {
    let instance: any;
    try {
      instance = new Received();
    } catch (e) {
      return {
        message: () => `expected received arg to be a class: ${e.message}`,
        pass: false,
      };
    }
    const hasType =
      'type' in instance &&
      (instance.type === FinchConnectionType.Port ||
        instance.type === FinchConnectionType.Message);

    const hasStart =
      'onStart' in instance && typeof instance.onStart === 'function';
    const hasAddListener =
      'addMessageListener' in instance &&
      typeof instance.addMessageListener === 'function';

    if (!hasType || !hasStart || !hasAddListener) {
      const missingMethods = [
        hasType ? null : 'type',
        hasStart ? null : 'onStart',
        hasAddListener ? null : 'addMessageListener',
      ].filter(Boolean);
      return {
        message: () =>
          `Expected connection to have connection interface but is missing: ${missingMethods.join(
            ', ',
          )}`,
        pass: false,
      };
    }

    return {
      message: () => 'Connection is valid',
      pass: true,
    };
  },
});
