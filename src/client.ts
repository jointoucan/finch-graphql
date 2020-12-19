import browser from 'webextension-polyfill';
import { GenericVariables, TangerMessageKey, TangerMessage } from './types';

const messageCreator = <V extends GenericVariables = {}>(query: string, variables: V) => {
  return {
    type: TangerMessageKey.Generic,
    query,
    variables,
  };
};

export const queryApi = <T extends {} = {}, V extends GenericVariables = {}>(query: string, variables: V) => {
  return browser.runtime.sendMessage<TangerMessage<V>, T>(messageCreator<V>(query, variables));
};
