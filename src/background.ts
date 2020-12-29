import browser from "webextension-polyfill";
import { graphql, GraphQLSchema, DocumentNode, print } from "graphql";
import gql from "graphql-tag";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { isDocumentNode } from "./utils";
import {
  TanagerApiOptions,
  GenericVariables,
  TanagerMessage,
  TanagerMessageKey,
  TanagerContext,
  TanagerMessageSource,
  TanagerContextObj,
} from "./types";

export class TanagerApi {
  schema: GraphQLSchema;
  context: TanagerContext;
  constructor({
    context,
    attachMessages,
    attachExternalMessages,
    ...options
  }: TanagerApiOptions) {
    this.schema = makeExecutableSchema(options);
    this.context = context ?? {};

    this.onMessage = this.onMessage.bind(this);
    this.onExternalMessage = this.onExternalMessage.bind(this);

    if (attachMessages) {
      browser.runtime.onMessage.addListener(this.onMessage);
    }
    if (attachExternalMessages) {
      browser.runtime.onMessageExternal.addListener(this.onExternalMessage);
    }
  }

  private getContext(baseContext: TanagerContextObj = {}) {
    return typeof this.context === "function"
      ? this.context(baseContext)
      : {
          source: TanagerMessageSource.Internal,
          ...baseContext,
          ...this.context,
        };
  }

  isQueryDocumentNode(query: string | DocumentNode): query is DocumentNode {
    return typeof query === "object";
  }

  private documentNodeToString(query: DocumentNode) {
    return print(query);
  }

  async query<T extends {}, V extends GenericVariables>(
    query: string | DocumentNode,
    variables?: V,
    baseContext?: TanagerContextObj
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

  onMessage(message: TanagerMessage) {
    if (message.type === TanagerMessageKey.Generic && message.query) {
      const { variables, query } = message;
      return this.query(query, variables ?? {}, {
        source: TanagerMessageSource.Message,
      });
    }
  }

  onExternalMessage(message: TanagerMessage) {
    if (message.type === TanagerMessageKey.Generic && message.query) {
      const { variables, query } = message;
      return this.query(query, variables ?? {}, {
        source: TanagerMessageSource.ExternalMessage,
      });
    }
  }
}
