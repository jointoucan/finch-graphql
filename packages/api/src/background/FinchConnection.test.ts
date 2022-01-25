import { FinchPortConnection } from './FinchPortConnection';
import { FinchNullConnection } from './FinchNullConnection';
import { FinchMessageConnection } from './FinchMessageConnection';

describe('connections', () => {
  beforeEach(() => {
    window.chrome = undefined;
  });
  afterEach(() => {
    // @ts-ignore
    browser.runtime.onConnect.addListener.mockReset();
    // @ts-ignore
    browser.runtime.onConnect.removeListener.mockReset();
    // @ts-ignore
    browser.runtime.onConnectExternal.addListener.mockReset();
    // @ts-ignore
    browser.runtime.onConnectExternal.removeListener.mockReset();
    // @ts-ignore
    browser.runtime.onMessage.addListener.mockReset();
  });
  describe('FinchNullConnection', () => {
    it('should have a valid connection interface', () => {
      expect(FinchNullConnection).toBeValidConnection();
    });
  });
  describe('FinchPortConnection', () => {
    it('should have a valid connection interface', () => {
      expect(FinchPortConnection).toBeValidConnection();
    });
    it('should listen to port connections', () => {
      const connection = new FinchPortConnection({
        messagePortName: 'test',
        external: true,
      });
      const teardown = connection.onStart();
      expect(browser.runtime.onConnect.addListener).toHaveBeenCalled();
      expect(browser.runtime.onConnectExternal.addListener).toHaveBeenCalled();

      teardown();
      expect(browser.runtime.onConnect.removeListener).toHaveBeenCalled();
      expect(
        browser.runtime.onConnectExternal.removeListener,
      ).toHaveBeenCalled();
    });
    it('should send messages from the port to a passed handler', async () => {
      // Setup connection start listening for connections
      const connection = new FinchPortConnection({
        messagePortName: 'test',
        external: false,
      });
      const teardown = connection.onStart();
      // Setup message listener and attach
      const listener = jest.fn().mockResolvedValue({
        type: 'bar',
      });
      connection.addMessageListener(listener);
      // Setup port connection
      const port = {
        name: 'test',
        onDisconnect: {
          addListener: jest.fn(),
        },
        onMessage: {
          addListener: jest.fn(),
        },
        postMessage: jest.fn(),
      };
      const portConnectionHandler =
        // @ts-ignore
        browser.runtime.onConnect.addListener.mock.calls[0][0];
      // Attach port
      portConnectionHandler(port);
      const messageHandler = port.onMessage.addListener.mock.calls[0][0];
      // Send message
      messageHandler({ id: 'foo' });
      expect(listener).toHaveBeenCalled();
      // Needed to make sure port message is resolved
      await listener();
      expect(port.postMessage).toHaveBeenCalledWith({
        id: 'foo',
        type: 'bar',
        external: false,
      });

      teardown();
    });
  });
  describe('FinchMessageConnection', () => {
    it('should be a valid connection', () => {
      expect(FinchMessageConnection).toBeValidConnection();
    });
    it('should listen to messages from the client', () => {
      const connection = new FinchMessageConnection({
        messageKey: 'test',
        external: false,
      });
      const teardown = connection.onStart();
      expect(browser.runtime.onMessage.addListener).toHaveBeenCalled();
      teardown();
    });
    it('should send messages to the client', async () => {
      const connection = new FinchMessageConnection({
        messageKey: 'test',
        external: false,
      });
      const listener = jest.fn().mockResolvedValue({
        type: 'bar',
      });
      connection.addMessageListener(listener);
      const teardown = connection.onStart();
      const messageHandler =
        // @ts-ignore
        browser.runtime.onMessage.addListener.mock.calls[0][0];
      messageHandler({ id: 'foo' });
      expect(listener).toHaveBeenCalled();
      // Needed to make sure port message is resolved
      await listener();
      teardown();
    });
  });
});
