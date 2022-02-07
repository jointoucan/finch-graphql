import {
  onConnectExternal,
  onConnect,
  removeConnectExternalListener,
  removeConnectListener,
} from '@finch-graphql/browser-polyfill';
import {
  AnyFinchMessage,
  FinchConnection,
  FinchConnectionType,
  FinchDefaultPortName,
  FinchMessageHandler,
} from '@finch-graphql/types';

interface FinchPortManagerOptions {
  messagePortName?: string;
  external?: boolean;
}

export class FinchPortConnection implements FinchConnection {
  /**
   * messagePorts is ports that are connected to the clients, and this is for messaging
   */
  messagePorts: Array<chrome.runtime.Port | browser.runtime.Port> = [];
  /**
   * unbind is a method that can be called to remove any existing listeners.
   */
  private unbind: () => void = () => {};
  /**
   * messageListener is the cache for the current message listener.
   */
  public messageListener: FinchMessageHandler;
  /**
   * portName is the name of the port that is used to connect to the extension.
   */
  private portName: string;
  /**
   * external value will let the auto connection mechanism know that you would like to connect from external sources.
   */
  private external: boolean = false;
  /**
   * This allows devtools to know what type of connection this is.
   */
  public type = FinchConnectionType.Port;
  /**
   * constructor pretty much sets up the message listener, and configures the message port names.
   * @param options.messagePortName is the port name
   * @param options.external is a boolean that will let the auto connection know that you would like to connect from external sources.
   */
  constructor({
    messagePortName,
    external = false,
  }: FinchPortManagerOptions = {}) {
    this.portName = messagePortName || FinchDefaultPortName;
    this.external = external;
  }

  /**
   * onStart interfaces with the FinchApi
   **/
  onStart() {
    this.listenForConnections({
      external: this.external,
      messagePortName: this.portName,
    });
    return () => {
      this.unbind();
    };
  }
  /**
   * onStart interfaces with the FinchApi
   **/
  addMessageListener(listener: FinchMessageHandler) {
    this.messageListener = listener;
  }

  /**
   * listenForConnections will listen for connections from the Finch devtools
   * if connected it will wait for the port to disconnect before cleaning up.
   * This method also set up a message handler that will listen for incoming messages
   * from devtools. This can be used for things like getting message keys of an extension
   * that allows auto connection / this will only be turned on when introspection is on.
   */
  public listenForConnections({
    external,
    messagePortName,
  }: FinchPortManagerOptions) {
    /**
     * Removes any existing connection listeners.
     */
    this.unbind();

    const onAddConnection = (isExternal: boolean) => (
      port: chrome.runtime.Port | browser.runtime.Port,
    ) => {
      /**
       * do nothing with ports that we should not be listening for.
       */
      if (port.name !== messagePortName) {
        return;
      }

      this.messagePorts.push(port);

      /**
       * This port disconnect handler just handles when a client disconnects we cleanup the connection
       * from the extension memory. If the connection is terminated from this side, eg like the background
       * process shutting down the client will attempt to make another connection.
       */
      port.onDisconnect.addListener(() => {
        const portIndex = this.messagePorts.indexOf(port);
        if (portIndex === -1) {
          return;
        }
        this.messagePorts.splice(portIndex, 1);
      });
      /**
       * This message listener allows devtools or messages from the client to be received.
       * This also will decorate the message with an id of the message and if the message is
       * coming from an external connection.
       */
      port.onMessage.addListener((msg: AnyFinchMessage) => {
        this.messageListener(msg, port.sender).then(resp => {
          port.postMessage({ id: msg.id, ...resp, external: isExternal });
        });
      });
    };
    const internalConnectionHandler = onAddConnection(false);
    const externalConnectionHandler = onAddConnection(true);
    onConnect(internalConnectionHandler);
    if (external) {
      onConnectExternal(externalConnectionHandler);
    }
    /**
     * modify the unbind method to remove the listeners that we created.
     */
    this.unbind = () => {
      try {
        removeConnectListener(internalConnectionHandler);
        if (external) {
          removeConnectExternalListener(externalConnectionHandler);
        }
      } catch (e) {
        // catching when port has already been disconnected.
        // do nothing.
      }
    };
  }
}
