import browser from "webextension-polyfill";
import { graphql, GraphQLSchema, DocumentNode, print } from "graphql";
import gql from "graphql-tag";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { isDocumentNode } from "./utils";
import {
  FinchApiOptions,
  GenericVariables,
  FinchMessage,
  FinchMessageKey,
  FinchContext,
  FinchMessageSource,
  FinchContextObj,
} from "./types";

export class FinchApi {
  schema: GraphQLSchema;
  context: FinchContext;
  constructor({
    context,
    attachMessages,
    attachExternalMessages,
    ...options
  }: FinchApiOptions) {
    this.schema = makeExecutableSchema(options);
    this.context = context ?? { source: FinchMessageSource.Internal };

    this.onMessage = this.onMessage.bind(this);
    this.onExternalMessage = this.onExternalMessage.bind(this);

    if (attachMessages) {
      browser.runtime.onMessage.addListener(this.onMessage);
    }
    if (attachExternalMessages) {
      browser.runtime.onMessageExternal.addListener(this.onExternalMessage);
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

    return graphql(
      this.schema,
      queryStr,
      { root: true },
      context,
      variables,
      operationName
    );
  }

  onMessage(message: FinchMessage, sender?: browser.runtime.MessageSender) {
    if (message.type === FinchMessageKey.Generic && message.query) {
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
    if (message.type === FinchMessageKey.Generic && message.query) {
      const { variables, query } = message;
      return this.query(query, variables ?? {}, {
        source: FinchMessageSource.ExternalMessage,
        sender,
      });
    }
  }
}
