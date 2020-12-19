import browser from 'webextension-polyfill';
import { GenericVariables, TanagerMessageKey, TanagerMessage } from './types';

const messageCreator = <V extends GenericVariables = {}>(query: string, variables: V) => {
  return {
    type: TanagerMessageKey.Generic,
    query,
    variables,
  };
};

export const queryApi = <T extends {} = {}, V extends GenericVariables = {}>(query: string, variables: V) => {
  return browser.runtime.sendMessage<TanagerMessage<V>, T>(messageCreator<V>(query, variables));
};
