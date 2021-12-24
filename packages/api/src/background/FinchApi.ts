import {
  graphql,
  validate,
  GraphQLSchema,
  DocumentNode,
  print,
  GraphQLError,
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
import {
  addExternalMessageListener,
  addMessageListener,
} from '@finch-graphql/browser-polyfill';
import { NoIntrospection } from './NoIntrospection';
import { FinchDevtools } from './FinchDevtools';
import { v4 } from 'uuid';
import { FinchPortManager } from './FinchPortManager';

export class FinchApi {
  schema: GraphQLSchema;
  context: FinchContext;
  onQueryResponse: FinchApiOptions['onQueryResponse'];
  messageKey?: string;
  disableIntrospection: boolean;
  rules: any[];
  devtools: FinchDevtools;
  portManager: FinchPortManager;
  constructor({
    context,
    attachMessages,
    attachExternalMessages,
    messageKey,
    onQueryResponse = () => {},
    disableIntrospection,
    validationRules = [],
    disableDevtools = false,
    ...options
  }: FinchApiOptions) {
    this.schema = makeExecutableSchema(options);
    if (options.middleware) {
      this.schema = applyMiddleware(this.schema, ...options.middleware);
    }
    this.context = context ?? { source: FinchMessageSource.Internal };
    this.messageKey = messageKey ?? FinchMessageKey.Generic;
    this.onQueryResponse = onQueryResponse;
    this.onMessage = this.onMessage.bind(this);
    this.onExternalMessage = this.onExternalMessage.bind(this);
    this.rules = validationRules;
    this.devtools = new FinchDevtools({
      autoListen: !disableDevtools,
      messageKey: disableIntrospection ? undefined : this.messageKey,
    });
    this.portManager = new FinchPortManager({
      onDevtoolMessage: async () => ({}),
      onMessage: this.onMessage,
    });

    if (disableIntrospection) {
      this.rules.unshift(NoIntrospection);
    }

    const attachOptions = {
      messageKey: this.messageKey,
    };

    if (attachMessages) {
      addMessageListener(this.onMessage, attachOptions);
    }
    if (attachExternalMessages) {
      addExternalMessageListener(this.onExternalMessage, attachOptions);
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
      this.devtools.onStart({
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
      this.devtools.onResponse({
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
}
