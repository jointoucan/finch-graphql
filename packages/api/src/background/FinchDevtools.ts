import { DocumentNode, GraphQLFormattedError } from 'graphql';
import { FinchContextObj } from '../types';
import {
  FinchStartMessage,
  FinchResponseMessage,
  FinchDevToolsMessageType,
} from './types';
import { FinchPortConnection } from './FinchPortConnection';
import { AnyFinchMessage, FinchConnectionType } from '@finch-graphql/types';

/**
 * FinchDevtools is a class that manages external connections from the Finch devtools
 * extension. This has the ability to listen for incoming connections add cleanup of those
 * connections.
 */
export class FinchDevtools extends FinchPortConnection {
  /**
   * `FinchDevtools.portName` is the exposed port name that the devtools will use for connections
   * to the Finch GraphQL API.
   */
  static portName = '_finchDevtools';
  /**
   * connectionType of the normal messages, used to detect how to connect to the extension.
   */
  private connectionType: FinchConnectionType;
  /**
   * if the connection is message based, this will be the message key that is used to connect
   */
  private messageKey?: string;
  /**
   * if the messaging is port based, this will be populated with the port name.
   */
  private messagePortName?: string;
  /**
   * listenForConnections will listen for connections from the Finch devtools
   * if connected it will wait for the port to disconnect before cleaning up.
   * This method also set up a message handler that will listen for incoming messages
   * from devtools. This can be used for things like getting message keys of an extension
   * that allows auto connection / this will only be turned on when introspection is on.
   */

  constructor({
    connectionType,
    messagePortName,
    messageKey,
  }: {
    connectionType: FinchConnectionType;
    messagePortName?: string;
    messageKey?: string;
  }) {
    super({
      messagePortName: FinchDevtools.portName,
      // Needed to connect to external port.
      external: true,
    });
    this.connectionType = connectionType;
    this.messageKey = messageKey;
    this.messagePortName = messagePortName;
    this.messageListener = async (msg: AnyFinchMessage) => {
      switch (msg.type) {
        /**
         * RequestMessageKey message is devtools trying to auto configure the
         * message key of the application.
         */
        case FinchDevToolsMessageType.RequestMessageKey:
          if (this.messageKey) {
            return {
              type: FinchDevToolsMessageType.MessageKey,
              messageKey: this.messageKey,
            };
          }
          break;
        /**
         * HealthCheck message is the devtools seeing if the connection that
         * is made is valid, and getting some basic metrics about the connection.
         */
        case FinchDevToolsMessageType.HealthCheck:
          return {
            type: FinchDevToolsMessageType.HealthCheckOk,
          };

        case FinchDevToolsMessageType.RequestConnectionInfo:
          return {
            type: FinchDevToolsMessageType.ConnectionInfo,
            messageKey: this.messageKey,
            messagePortName: this.messagePortName,
            connectionType: this.connectionType,
          };

        default:
          break;
      }
      return {};
    };
  }
  /**
   * broadcast allows us to send a message to all current connections.
   * @param message any message but must be an object.
   */
  broadcast<T extends {}>(message: T) {
    this.messagePorts.forEach(port => {
      port.postMessage(message);
    });
  }

  /**
   * startQuery is a method that is called when a query or mutation starts. This
   * call indicates the start of a graphql query, and the basic meta information
   * is sent.
   * @param info an object of meta information about the query like the query, variables and context.
   * @returns an id string that we store in the handler of the query to be able to send the end event.
   */
  public startQuery({
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
   * queryResponse is sent when we have a response from the top level resolvers. This can be
   * an error or the data. There is some meta info that it sends attached to the request id.
   * @param info onResponse info varies greatly from startQuery and only the response and time taken
   * is sent.
   */
  public queryResponse = async ({
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
