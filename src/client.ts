import browser from "webextension-polyfill";
import { DocumentNode, GraphQLFormattedError } from "graphql";
import gql from "graphql-tag";
import { GenericVariables, TanagerMessageKey, TanagerMessage } from "./types";
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
  extensionId?: string
) => {
  const args:
    | [string, ReturnType<typeof messageCreator>]
    | [ReturnType<typeof messageCreator>] = [
    messageCreator<V>(query, variables),
  ];
  if (extensionId) {
    args.unshift(extensionId);
  }
  const resp = browser.runtime.sendMessage<TanagerMessage<V>, T>(...args) as {
    data: T | null;
    errors?: GraphQLFormattedError[];
  };
  return resp;
};
