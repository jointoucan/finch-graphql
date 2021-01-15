import browser from "webextension-polyfill";
import { DocumentNode, GraphQLFormattedError } from "graphql";
import gql from "graphql-tag";
import {
  GenericVariables,
  FinchMessageKey,
  FinchMessage,
  FinchQueryOptions,
} from "./types";
import { isDocumentNode } from "./utils";

const messageCreator = <Variables extends GenericVariables = {}>(
  query: string | DocumentNode,
  variables: Variables
) => {
  return {
    type: FinchMessageKey.Generic,
    query: isDocumentNode(query) ? query : gql(query),
    variables,
  };
};

export const queryApi = async <
  Query extends {} = {},
  Variables extends GenericVariables = {}
>(
  query: string | DocumentNode,
  variables?: Variables,
  options: FinchQueryOptions = {}
) => {
  const { id: extensionId } = options;
  const args:
    | [string, ReturnType<typeof messageCreator>]
    | [ReturnType<typeof messageCreator>] = extensionId
    ? [extensionId, messageCreator<Variables>(query, variables)]
    : [messageCreator<Variables>(query, variables)];

  const resp = browser.runtime.sendMessage<FinchMessage<Variables>, Query>(
    ...args
  ) as {
    data: Query | null;
    errors?: GraphQLFormattedError[];
  };
  return resp;
};
