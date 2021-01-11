import browser from "webextension-polyfill";
import { DocumentNode, GraphQLFormattedError } from "graphql";
import gql from "graphql-tag";
import {
  GenericVariables,
  TanagerMessageKey,
  TanagerMessage,
  TanagerQueryOptions,
} from "./types";
import { isDocumentNode } from "./utils";

const messageCreator = <V extends GenericVariables = {}>(
  query: string | DocumentNode,
  variables: V
) => {
  return {
    type: TanagerMessageKey.Generic,
    query: isDocumentNode(query) ? query : gql(query),
    variables,
  };
};

export const queryApi = async <
  T extends {} = {},
  V extends GenericVariables = {}
>(
  query: string | DocumentNode,
  variables?: V,
  options: TanagerQueryOptions = {}
) => {
  const { id: extensionId } = options;
  const args:
    | [string, ReturnType<typeof messageCreator>]
    | [ReturnType<typeof messageCreator>] = extensionId
    ? [extensionId, messageCreator<V>(query, variables)]
    : [messageCreator<V>(query, variables)];

  const resp = browser.runtime.sendMessage<TanagerMessage<V>, T>(...args) as {
    data: T | null;
    errors?: GraphQLFormattedError[];
  };
  return resp;
};
