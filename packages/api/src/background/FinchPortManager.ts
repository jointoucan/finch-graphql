import {
  onConnectExternal,
  onConnect,
  removeConnectExternalListener,
  removeConnectListener,
} from '@finch-graphql/browser-polyfill';
import { FinchDefaultPortName } from '@finch-graphql/types';
import { FinchMessage } from '..';
import { FinchDevtoolsIncomingMessage } from './types';

type AnyMessage = (FinchDevtoolsIncomingMessage | FinchMessage<unknown>) & {
  id: string;
};

interface FinchPortManagerOptions {
  onDevtoolMessage: (msg: AnyMessage) => Promise<object>;
  onMessage: (msg: AnyMessage) => Promise<object>;
  messagePortName?: string;
  external?: boolean;
}

export class FinchPortManager {
  /**
   * `FinchPortManager.devtoolsPortName` is the exposed port name that the devtools will use for connections
   * to the Finch GraphQL API.
   */
  static devtoolsPortName = '_finchDevtools';
  /**
   * devtoolsPorts is ports that are connected to the devtools extension.
   */
  devtoolsPorts: Array<chrome.runtime.Port | browser.runtime.Port> = [];
  /**
   * messagePorts is ports that are connected to the clients, and this is for messaging
   */
  messagePorts: Array<chrome.runtime.Port | browser.runtime.Port> = [];
  /**
   * unbind is a method that can be called to remove any existing listeners.
   */
  private unbind: () => void = () => {};
  /**
   * constructor pretty much sets up the message listener, and configures the message port names.
   * @param options.messagePortName is the messagePort name
   * @param options.onMessage is called when a message is received
   * @param options.onDevtoolMessage is called when devtools message is called
   */
  constructor({
    messagePortName,
    onDevtoolMessage,
    onMessage,
    // external default to true to support devtools
    external = true,
  }: FinchPortManagerOptions) {
    this.listenForConnections({
      external,
      onMessage,
      onDevtoolMessage,
      messagePortName: messagePortName || FinchDefaultPortName,
    });
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
    onMessage,
    onDevtoolMessage,
    messagePortName,
  }: FinchPortManagerOptions) {
    /**
     * Removes any existing connection listeners.
     */
    this.unbind();

    const onAddConnection = (
      port: chrome.runtime.Port | browser.runtime.Port,
    ) => {
      /**
       * do nothing with ports that we should not be listening for.
       */
      if (
        port.name !== FinchPortManager.devtoolsPortName &&
        port.name !== messagePortName
      ) {
        return;
      }

      const isDevPort = port.name === FinchPortManager.devtoolsPortName;
      const portType: 'devtoolsPorts' | 'messagePorts' = isDevPort
        ? 'devtoolsPorts'
        : 'messagePorts';

      this[portType].push(port);

      /**
       * This port disconnect handler just handles when a client disconnects we cleanup the connection
       * from the extension memory. If the connection is terminated from this side, eg like the background
       * process shutting down the client will attempt to make another connection.
       */
      port.onDisconnect.addListener(() => {
        const portIndex = this[portType].indexOf(port);
        if (portIndex === -1) {
          return;
        }
        this[portType].splice(portIndex, 1);
      });
      /**
       * This message listener allows the devtools extension to request information
       * when needed. Like message keys, when the devtools extension would like a message key
       * to know how to talk to an extension this is used. This can also be blocked by introspection
       * being turned off.
       */
      port.onMessage.addListener((msg: AnyMessage) => {
        if (isDevPort) {
          onDevtoolMessage(msg).then(resp => port.postMessage(resp));
          return;
        }
        onMessage(msg).then(resp => {
          port.postMessage({ id: msg.id, ...resp });
        });
      });
    };
    onConnect(onAddConnection);
    if (external) {
      onConnectExternal(onAddConnection);
    }
    this.unbind = () => {
      removeConnectListener(onAddConnection);
      if (external) {
        removeConnectExternalListener(onAddConnection);
      }
    };
  }

  /**
   * stopListeningForConnections is just a proxy for unbind.
   */
  public stopListeningForConnections() {
    this.unbind();
  }
}
