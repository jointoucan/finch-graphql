import {
  graphql,
  validate,
  GraphQLSchema,
  DocumentNode,
  print,
  GraphQLError,
  ValidationRule,
} from 'graphql';
import gql from 'graphql-tag';
import { applyMiddleware } from 'graphql-middleware';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { isDocumentNode } from '../utils';
import {
  FinchApiOptions,
  GenericVariables,
  FinchMessage,
  FinchMessageKey,
  FinchContext,
  FinchMessageSource,
  FinchContextObj,
  FinchExecutionResults,
} from '../types';
import { NoIntrospection } from './NoIntrospection';
import { FinchDevtools } from './FinchDevtools';
import { v4 } from 'uuid';
import { FinchPortConnection } from './FinchPortConnection';
import { FinchConnection, FinchDefaultPortName } from '@finch-graphql/types';

/**
 * FinchApi is the main class that is used to create an executable graphql schema and
 * connect to any incoming connections. If you would like to turn off auto connection please
 * pass an instance of FinchNullConnection to turn of auto connection. The main two keys to pass
 * to the FinchApi are `typeDefs` and `schema`. This defines the GraphQL API of your extension.
 *
 * ```typescript
 * import { FinchApi } from '@finch-graphql/api';
 *
 * const graphqlAPI = new FinchApi({
 *  typeDefs,
 *  schema,
 * });
 * ```
 *
 * To see all the options visit the [docs](https://jointoucan.github.io/finch-graphql/docs/api-ref).
 */
export class FinchApi {
  schema: GraphQLSchema;
  context: FinchContext;
  onQueryResponse: FinchApiOptions['onQueryResponse'];
  messageKey?: string;
  messagePortName?: string;
  disableIntrospection: boolean;
  rules: ValidationRule[];
  devtools?: FinchDevtools;
  connection: FinchConnection;
  closeConnection?: () => void;
  constructor({
    context,
    messageKey,
    messagePortName,
    onQueryResponse = () => {},
    disableIntrospection,
    validationRules = [],
    disableDevtools = false,
    connection,
    ...options
  }: FinchApiOptions) {
    this.schema = makeExecutableSchema(options);
    if (options.middleware) {
      this.schema = applyMiddleware(this.schema, ...options.middleware);
    }
    this.context = context ?? { source: FinchMessageSource.Internal };
    this.messageKey = messageKey ?? FinchMessageKey.Generic;
    this.messagePortName = messagePortName ?? FinchDefaultPortName;
    this.onQueryResponse = onQueryResponse;
    this.onMessage = this.onMessage.bind(this);
    this.onExternalMessage = this.onExternalMessage.bind(this);
    this.rules = validationRules;

    /**
     * Setup connection to the clients
     * defaults to a port connection when no connection is passed.
     */
    this.connection =
      connection ??
      new FinchPortConnection({
        messagePortName: this.messagePortName,
        // Supported out of box for devtools
        external: true,
      });

    if (this.connection) {
      this.connection.addMessageListener(this.onMessage);
      this.closeConnection = this.connection.onStart();
    }

    /**
     * Setup devtools if enabled
     */
    if (!disableDevtools) {
      this.devtools = new FinchDevtools({
        messageKey: disableIntrospection ? undefined : this.messageKey,
        connectionType: this.connection.type,
        messagePortName: disableIntrospection
          ? undefined
          : this.messagePortName,
      });
      this.devtools.onStart();
    }

    if (disableIntrospection) {
      this.rules.unshift(NoIntrospection);
    }
  }

  private getContext(baseContext?: FinchContextObj) {
    return typeof this.context === 'function'
      ? this.context(baseContext)
      : {
          source: FinchMessageSource.Internal,
          ...this.context,
          ...(baseContext ?? {}),
        };
  }

  isQueryDocumentNode(query: string | DocumentNode): query is DocumentNode {
    return typeof query === 'object';
  }

  private documentNodeToString(query: DocumentNode) {
    return print(query);
  }

  async query<Query extends {}, Variables extends GenericVariables>(
    query: string | DocumentNode,
    variables?: Variables,
    baseContext?: FinchContextObj,
  ) {
    const id = v4();
    const context = this.getContext(baseContext);
    const documentNode = isDocumentNode(query) ? query : gql(query);
    const queryStr = isDocumentNode(query)
      ? this.documentNodeToString(query)
      : query;

    let operationName = undefined;
    const operationDef = documentNode.definitions.find(
      def => def.kind === 'OperationDefinition',
    );
    if (operationDef && 'name' in operationDef) {
      operationName = operationDef?.name?.value ?? undefined;
    }

    // Send initial query to devtools
    try {
      this.devtools.startQuery({
        id,
        query: documentNode,
        variables,
        context,
        operationName,
      });
    } catch (e) {
      console.warn(e);
    }

    let validationErrors: readonly GraphQLError[] = [];
    if (this.rules.length) {
      validationErrors = validate(this.schema, documentNode, this.rules);
    }

    const ts = performance.now();
    const shouldExecute = !validationErrors.length;

    const response = (await (shouldExecute
      ? graphql(
          this.schema,
          queryStr,
          { root: true },
          context,
          variables,
          operationName,
        )
      : Promise.resolve({
          errors: validationErrors,
        }))) as FinchExecutionResults<Query>;

    const timeTaken = Math.round(performance.now() - ts);

    // NOTE: This ensures outside code stop execution of this function.
    try {
      this.onQueryResponse({
        query: documentNode,
        variables,
        context,
        timeTaken,
        operationName,
        response,
      });
    } catch (e) {
      console.warn(e);
    }

    // Send response to devtools
    try {
      this.devtools.queryResponse({
        id,
        timeTaken,
        response,
      });
    } catch (e) {
      console.warn(e);
    }

    return response;
  }

  onMessage(message: FinchMessage, sender?: browser.runtime.MessageSender) {
    const messageKey = this.messageKey ?? FinchMessageKey.Generic;
    if (message.type === messageKey && message.query) {
      const { variables, query } = message;
      return this.query(query, variables ?? {}, {
        source: message.external
          ? FinchMessageSource.ExternalMessage
          : FinchMessageSource.Message,
        sender,
      });
    }
  }

  onExternalMessage(
    message: FinchMessage,
    sender?: browser.runtime.MessageSender,
  ) {
    const messageKey = this.messageKey ?? FinchMessageKey.Generic;
    if (message.type === messageKey && message.query) {
      const { variables, query } = message;
      return this.query(query, variables ?? {}, {
        source: FinchMessageSource.ExternalMessage,
        sender,
      });
    }
  }

  close() {
    this.closeConnection?.();
  }
}
