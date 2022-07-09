import { FinchClient, FinchClientStatus } from './FinchClient';

describe('FinchClient', () => {
  describe('a port connection', () => {
    let mockPort: browser.runtime.Port;
    let originalConnect: () => browser.runtime.Port;
    beforeEach(() => {
      originalConnect = browser.runtime.connect;
      mockPort = {
        name: 'mockPort',
        disconnect: jest.fn(),
        postMessage: jest.fn(),
        onDisconnect: {
          addListener: jest.fn(),
          removeListener: jest.fn(),
          hasListener: jest.fn(),
        },
        onMessage: {
          addListener: jest.fn(),
          removeListener: jest.fn(),
          hasListener: jest.fn(),
        },
      };
      browser.runtime.connect = jest.fn().mockImplementation(() => mockPort);
    });
    afterEach(() => {
      browser.runtime.connect = originalConnect;
    });
    it('should attempt to connect a port if useMessages is false', () => {
      const client = new FinchClient({
        useMessages: false,
        autoStart: true,
      });
      expect(browser.runtime.connect).toHaveBeenCalledTimes(1);
      expect(mockPort.onDisconnect.addListener).toHaveBeenCalledTimes(1);
      expect(client.status).toBe(FinchClientStatus.Connected);
    });
    it('should attach a message listener when a query is made', () => {
      const client = new FinchClient({
        useMessages: false,
        autoStart: true,
      });
      client.query('query foo { bar }');
      expect(mockPort.onMessage.addListener).toHaveBeenCalledTimes(1);
    });
    it('should detach a message listener when a query is resolved', async () => {
      const client = new FinchClient({
        useMessages: false,
        autoStart: true,
      });
      let messageListener: (response: object) => void = jest.fn();
      mockPort.onMessage.addListener = jest.fn(listener => {
        messageListener = listener;
      });
      mockPort.postMessage = jest.fn();
      const pendingQuery = client.query('query foo { bar }');
      // @ts-ignore
      const message = mockPort.postMessage.mock.calls[0][0];
      const id = message.id;
      messageListener({ id, data: 'foo' });
      const resp = await pendingQuery;
      expect(resp.data).toBe('foo');
      expect(mockPort.onMessage.removeListener).toHaveBeenCalledTimes(1);
    });
    it('should timeout a query if no response is given after a certain time', async () => {
      const client = new FinchClient({
        useMessages: false,
        autoStart: true,
        messageTimeout: 0,
      });
      const resp = await client.query('query foo { bar }');
      expect(resp.errors?.[0].message).toBe(
        'Timed out waiting for response from background script',
      );
    });
    it('should try to reconnect a port after a given number of timeouts', async () => {
      const client = new FinchClient({
        useMessages: false,
        autoStart: true,
        maxPortTimeoutCount: 2,
        messageTimeout: 0,
      });
      expect(browser.runtime.connect).toHaveBeenCalledTimes(1);
      await client.query('query foo { bar }');
      await client.query('query foo { bar }');
      expect(browser.runtime.connect).toHaveBeenCalledTimes(2);
    });
    it('should cancel any ongoing messages when a reconnect happens', async () => {
      const client = new FinchClient({
        useMessages: false,
        autoStart: true,
        maxPortTimeoutCount: 2,
        messageTimeout: 0,
      });
      expect(browser.runtime.connect).toHaveBeenCalledTimes(1);
      await client.query('query foo { bar }');
      const timeoutPendingQuery = client.query(
        'query foo { bar }',
        {},
        { timeout: 100 },
      );
      const pendingQuery = client.query(
        'query foo { bar }',
        {},
        { timeout: 1000 },
      );
      await timeoutPendingQuery;
      expect(browser.runtime.connect).toHaveBeenCalledTimes(2);
      const resp = await pendingQuery;
      expect(resp.errors?.[0].message).toBe('Promise cancelled');
    });
  });
});
