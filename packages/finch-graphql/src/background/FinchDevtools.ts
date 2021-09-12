import { DocumentNode, GraphQLFormattedError } from 'graphql';
import {
  onConnectExternal,
  removeConnectExternalListener,
} from '@finch-graphql/browser-polyfill';
import { FinchContextObj } from '../types';
import {
  FinchStartMessage,
  FinchResponseMessage,
  FinchDevToolsMessageType,
  FinchDevtoolsIncomingMessage,
} from './types';

/**
 * FinchDevtools is a class that manages external connections from the Finch devtools
 * extension. This has the ability to listen for incoming connections add cleanup of those
 * connections.
 */
export class FinchDevtools {
  /**
   * `FinchDevtools.portName` is the exposed port name that the devtools will use for connections
   * to the Finch GraphQL API.
   */
  static portName = '_finchDevtools';
  /**
   * messageKey is not needed for FinchDevTools to function it just make setting up the FinchDevtools more
   * of a manual process.
   */
  private messageKey?: string;
  /**
   * connection is a cache of the current connections attached to this instance of FinchDevtools.
   */
  private connections: (browser.runtime.Port | chrome.runtime.Port)[] = [];
  /**
   * unbind is a method that can be called to remove any existing listeners.
   */
  private unbind: () => void = () => {};

  constructor(
    options: { autoListen: boolean; messageKey?: string } = {
      autoListen: true,
    },
  ) {
    this.messageKey = options.messageKey;
    if (options.autoListen) {
      this.listenForConnections();
    }
  }

  /**
   * listenForConnections will listen for connections from the Finch devtools
   * if connected it will wait for the port to disconnect before cleaning up.
   * This method also set up a message handler that will listen for incoming messages
   * from devtools. This can be used for things like getting message keys of an extension
   * that allows auto connection / this will only be turned on when introspection is on.
   */
  public listenForConnections() {
    /**
     * Removes any existing connection listeners.
     */
    this.unbind();

    const onAddConnection = (
      port: chrome.runtime.Port | browser.runtime.Port,
    ) => {
      if (port.name !== FinchDevtools.portName) {
        return;
      }
      this.connections.push(port);
      /**
       * This port disconnect handler just handles when a client disconnects we cleanup the connection
       * from the extension memory. If the connection is terminated from this side, eg like the background
       * process shutting down the client will attempt to make another connection.
       */
      port.onDisconnect.addListener(() => {
        const portIndex = this.connections.indexOf(port);
        if (portIndex === -1) {
          return;
        }
        this.connections.splice(portIndex, 1);
      });
      /**
       * This message listener allows the devtools extension to request information
       * when needed. Like message keys, when the devtools extension would like a message key
       * to know how to talk to an extension this is used. This can also be blocked by introspection
       * being turned off.
       */
      port.onMessage.addListener((msg: FinchDevtoolsIncomingMessage) => {
        switch (msg.type) {
          /**
           * RequestMessageKey message is devtools trying to auto configure the
           * message key of the application.
           */
          case FinchDevToolsMessageType.RequestMessageKey:
            if (this.messageKey) {
              port.postMessage({
                type: FinchDevToolsMessageType.MessageKey,
                messageKey: this.messageKey,
              });
            }
            break;
          /**
           * HealthCheck message is the devtools seeing if the connection that
           * is made is valid, and getting some basic metrics about the connection.
           */
          case FinchDevToolsMessageType.HealthCheck:
            port.postMessage({
              type: FinchDevToolsMessageType.HealthCheckOk,
            });
            break;
          default:
            break;
        }
      });
    };
    onConnectExternal(onAddConnection);
    this.unbind = () => {
      removeConnectExternalListener(onAddConnection);
    };
  }

  /**
   * stopListeningForConnections is just a proxy for unbind.
   */
  public stopListeningForConnections() {
    this.unbind();
  }

  /**
   * broadcast allows us to send a message to all current connections.
   * @param message any message but must be an object.
   */
  broadcast<T extends {}>(message: T) {
    this.connections.forEach(port => {
      port.postMessage(message);
    });
  }

  /**
   * onStart is a method that is called when a query or mutation starts. This
   * call indicates the start of a graphql query, and the basic meta information
   * is sent.
   * @param info an object of meta information about the query like the query, variables and context.
   * @returns an id string that we store in the handler of the query to be able to send the end event.
   */
  onStart({
    id,
    query,
    operationName,
    variables,
    context,
  }: {
    id: string;
    query: DocumentNode;
    operationName: string;
    variables: unknown;
    context: FinchContextObj;
  }) {
    this.broadcast<FinchStartMessage>({
      type: FinchDevToolsMessageType.Start,
      id,
      query,
      operationName: operationName ?? 'unknown',
      initializedAt: Date.now(),
      variables,
      context,
    });
    return id;
  }

  /**
   * onResponse is sent when we have a response from the top level resolvers. This can be
   * an error or the data. There is some meta info that it sends attached to the request id.
   * @param info onResponse info varies greatly from onStart and only the response and time taken
   * is sent.
   */
  onResponse = async ({
    id,
    timeTaken,
    response,
  }: {
    id: string;
    timeTaken: number;
    response: { data?: unknown; errors?: GraphQLFormattedError[] };
  }) => {
    this.broadcast<FinchResponseMessage>({
      type: FinchDevToolsMessageType.Response,
      id,
      timeTaken,
      response,
    });
  };
}
