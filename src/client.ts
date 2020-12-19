import browser from 'webextension-polyfill';
import { GenericVariables, GraphQLMessageKey, GraphQLMessage } from './types';

const messageCreator = <V extends GenericVariables = {}>(query: string, variables: V) => {
  return {
    type: GraphQLMessageKey.Generic,
    query,
    variables,
  };
};

export const query = <T extends {} = {}, V extends GenericVariables = {}>(query: string, variables: V) => {
  return browser.runtime.sendMessage<GraphQLMessage<V>, T>(messageCreator<V>(query, variables));
};
