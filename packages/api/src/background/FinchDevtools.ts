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

    this.messageListener = async (msg: AnyFinchMessage) => {
      switch (msg.type) {
        /**
         * RequestMessageKey message is devtools trying to auto configure the
         * message key of the application.
         */
        case FinchDevToolsMessageType.RequestMessageKey:
          if (messageKey) {
            return {
              type: FinchDevToolsMessageType.MessageKey,
              messageKey,
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
            messageKey,
            messagePortName,
            connectionType,
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
