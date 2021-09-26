import { DocumentNode, GraphQLFormattedError } from 'graphql';
import gql from 'graphql-tag';
import { sendMessage } from '@finch-graphql/browser-polyfill';
import { isListeningOnDocument, queryApiFromDocument } from '../external';
import {
  GenericVariables,
  FinchMessageKey,
  FinchQueryOptions,
} from '@finch-graphql/types';
import { isDocumentNode } from '../utils';

/**
 * messageCreator is a function that create a finch message to send to the background process
 * @param query the graphQL query to send to api
 * @param variables the variables for the graphQL query.
 * @param messageKey optional message key that will get sent to background script
 * @returns the custom message object for this query
 */
const messageCreator = <Variables extends GenericVariables = {}>(
  query: string | DocumentNode,
  variables: Variables,
  messageKey?: string,
  external?: boolean,
) => {
  return {
    type: messageKey ?? FinchMessageKey.Generic,
    query: isDocumentNode(query) ? query : gql(query),
    variables,
    external,
  };
};

/**
 * queryApi is a methods that adds a sugary syntax on-top of browser.messaging
 * for Finch GraphQL. This makes it so you can call this method without having to
 * worry about how the message is getting sent.
 * @param query a string or graphQL Document Node query
 * @param variables the variables for the graphQL query.
 * @param options set of options for configuring this query.
 * @param options.messageKey a custom message key to send to the extension
 * @param options.id an id of the extension to send the query to.
 * @param options.external if the call is coming from an external location
 * @returns a promise that resolves a graphQL response.
 */
export const queryApi = async <
  Query extends {} = {},
  Variables extends GenericVariables = {}
>(
  query: string | DocumentNode,
  variables?: Variables,
  options: FinchQueryOptions = {},
) => {
  const { id: extensionId, messageKey } = options;
  const args: [string, unknown] | [unknown] = [
    messageCreator<Variables>(query, variables, messageKey, options.external),
  ];

  if (extensionId) {
    args.unshift(extensionId);
    if (isListeningOnDocument()) {
      return queryApiFromDocument<Query, Variables>(query, variables, {
        extensionId,
      });
    }
  }

  return sendMessage<{
    data: Query | null;
    errors?: GraphQLFormattedError[];
  }>(...args);
};
