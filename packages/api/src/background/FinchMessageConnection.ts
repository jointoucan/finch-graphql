import {
  addMessageListener,
  addExternalMessageListener,
} from '@finch-graphql/browser-polyfill';
import {
  FinchConnection,
  FinchConnectionType,
  FinchMessageHandler,
  FinchMessageKey,
} from '@finch-graphql/types';

interface FinchMessageConnectionOptions {
  messageKey?: string;
  external?: boolean;
}

/**
 * FinchMessageConnection is a connection that listens for messages from the client.
 * It emulates the default behavior of Finch GraphQL v2.x. with auto connect
 * v3.x. defaults to port connections.
 *
 * To turn off auto connect, pass in FinchNullConnection as your connector.
 *
 */
export class FinchMessageConnection implements FinchConnection {
  /**
   * unbind is a method that can be called to remove any existing listeners.
   */
  private unbind: () => void = () => {};
  /**
   * external allows you to allow external connections.
   */
  private external: boolean = false;
  /**
   * messageKey is the custom key that the messages will use.
   */
  private messageKey: string;
  /**
   * messageListener is the cache for the current message listener.
   */
  private messageListener: FinchMessageHandler;
  /**
   * This allows devtools to know what type of connection this is.
   */
  type: FinchConnectionType.Message;
  /**
   * constructor pretty much sets up the message listener, and configures the message names names.
   * @param options.messageKey is the messagePort name
   * @param options.external allows the connector to connect to external sources
   */
  constructor({
    messageKey,
    external = false,
  }: FinchMessageConnectionOptions = {}) {
    this.external = external;
    this.messageKey = messageKey ?? FinchMessageKey.Generic;
  }

  /**
   * onStart interfaces with the FinchApi
   **/
  onStart() {
    // Add message listeners
    this.listenForConnections({
      external: this.external,
      messageKey: this.messageKey,
    });
    return () => {
      // Remove them
      this.unbind();
    };
  }
  /**
   * addMessageListener interfaces with the FinchApi
   **/
  addMessageListener(listener: FinchMessageHandler) {
    this.messageListener = listener;
  }

  public listenForConnections({
    external,
    messageKey,
  }: FinchMessageConnectionOptions) {
    /**
     * Removes any existing connection listeners.
     */
    this.unbind();

    addMessageListener(this.messageListener, { messageKey });
    if (external) {
      addExternalMessageListener(this.messageListener, { messageKey });
    }

    this.unbind = () => {
      // TODO: Remove all listeners
    };
  }
}
