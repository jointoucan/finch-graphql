import {
  graphql,
  validate,
  GraphQLSchema,
  DocumentNode,
  print,
  GraphQLError,
} from "graphql";
import gql from "graphql-tag";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { isDocumentNode } from "../utils";
import {
  FinchApiOptions,
  GenericVariables,
  FinchMessage,
  FinchMessageKey,
  FinchContext,
  FinchMessageSource,
  FinchContextObj,
} from "../types";
import { addExteneralMessageListener, addMessageListener } from "../browser";
import { NoIntrospection } from "./introspection";

export class FinchApi {
  schema: GraphQLSchema;
  context: FinchContext;
  onQueryResponse: FinchApiOptions["onQueryResponse"];
  messageKey?: string;
  disableIntrospection: boolean;
  rules: any[];
  constructor({
    context,
    attachMessages,
    attachExternalMessages,
    messageKey,
    onQueryResponse = () => {},
    disableIntrospection,
    validationRules = [],
    ...options
  }: FinchApiOptions) {
    this.schema = makeExecutableSchema(options);
    this.context = context ?? { source: FinchMessageSource.Internal };
    this.messageKey = messageKey;
    this.onQueryResponse = onQueryResponse;
    this.onMessage = this.onMessage.bind(this);
    this.onExternalMessage = this.onExternalMessage.bind(this);
    this.rules = validationRules;

    if (disableIntrospection) {
      this.rules.unshift(NoIntrospection);
    }

    if (attachMessages) {
      addMessageListener(this.onMessage);
    }
    if (attachExternalMessages) {
      addExteneralMessageListener(this.onExternalMessage);
    }
  }

  private getContext(baseContext?: FinchContextObj) {
    return typeof this.context === "function"
      ? this.context(baseContext)
      : {
          source: FinchMessageSource.Internal,
          ...this.context,
          ...(baseContext ?? {}),
        };
  }

  isQueryDocumentNode(query: string | DocumentNode): query is DocumentNode {
    return typeof query === "object";
  }

  private documentNodeToString(query: DocumentNode) {
    return print(query);
  }

  async query<Query extends {}, Variables extends GenericVariables>(
    query: string | DocumentNode,
    variables?: Variables,
    baseContext?: FinchContextObj
  ) {
    const context = this.getContext(baseContext);
    const documentNode = isDocumentNode(query) ? query : gql(query);
    const queryStr = isDocumentNode(query)
      ? this.documentNodeToString(query)
      : query;

    let operationName = undefined;
    const operationDef = documentNode.definitions.find(
      (def) => def.kind === "OperationDefinition"
    );
    if (operationDef && "name" in operationDef) {
      operationName = operationDef?.name?.value ?? undefined;
    }

    let validationErrors: readonly GraphQLError[] = [];
    if (this.rules.length) {
      validationErrors = validate(this.schema, documentNode, this.rules);
    }

    const ts = performance.now();
    const shouldExecute = !validationErrors.length;

    const response = await (shouldExecute
      ? graphql(
          this.schema,
          queryStr,
          { root: true },
          context,
          variables,
          operationName
        )
      : Promise.resolve({
          errors: validationErrors,
        }));

    const timeTaken = Math.round(performance.now() - ts);

    // NOTE: This ensure not outside code breaks this functionality
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

    return response;
  }

  onMessage(message: FinchMessage, sender?: browser.runtime.MessageSender) {
    const messageKey = this.messageKey ?? FinchMessageKey.Generic;
    if (message.type === messageKey && message.query) {
      const { variables, query } = message;
      return this.query(query, variables ?? {}, {
        source: FinchMessageSource.Message,
        sender,
      });
    }
  }

  onExternalMessage(
    message: FinchMessage,
    sender?: browser.runtime.MessageSender
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
