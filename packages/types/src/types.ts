import { DocumentNode, ExecutionResult, GraphQLError } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';

export enum FinchMessageKey {
  Generic = 'Finch-message',
}

export enum FinchMessageSource {
  Internal = 'internal',
  Message = 'message',
  ExternalMessage = 'external-message',
}

export enum FinchConnectionType {
  Port = 'port',
  Message = 'message',
}

export enum FinchCachePolicy {
  /**
   * CacheFirst will try to get the data from the cache, and respond with the
   * cached data and update the data in the background.
   */
  CacheFirst = 'cache-first',
  /**
   * FetchFirst will fetch and respond with the data from the fetch, and update the cache.
   */
  FetchFirst = 'fetch-first',
}

export const FinchDefaultPortName = '_finchMessagePort';

export type GenericVariables = { [key: string]: any };
export type FinchContextObj = {
  source: FinchMessageSource;
  sender?: browser.runtime.MessageSender;
  [key: string]: any;
};
export type FinchContext =
  | FinchContextObj
  | ((obj: FinchContextObj) => FinchContextObj);

type MakeExecSchemaOptions = Parameters<typeof makeExecutableSchema>[0];

interface QueryResponseMeta {
  query: DocumentNode;
  operationName?: string;
  variables: any;
  context: FinchContextObj;
  timeTaken: number;
  response: ExecutionResult;
}

export type FinchApiOptions = {
  context?: FinchContext;
  attachMessages?: boolean;
  attachExternalMessages?: boolean;
  typeDefs: MakeExecSchemaOptions['typeDefs'] | DocumentNode[];
  messageKey?: string;
  onQueryResponse?: (meta: QueryResponseMeta) => void;
  disableIntrospection?: boolean;
  validationRules?: Array<any>;
  middleware?: Array<Parameters<typeof applyMiddleware>[1]>;
  disableDevtools?: boolean;
} & MakeExecSchemaOptions;

export interface FinchMessage<Variables extends GenericVariables = {}> {
  type?: FinchMessageKey.Generic | string;
  query?: string | DocumentNode;
  variables?: Variables;
  external?: boolean;
}

export interface FinchQueryOptions {
  id?: string;
  port?: browser.runtime.Port;
  messageKey?: string;
  external?: boolean;
  timeout?: number;
  cachePolicy?: FinchCachePolicy;
}

export interface FinchExecutionResults<Query> {
  data?: Query;
  readonly errors?: GraphQLError[];
}

export enum FinchDevToolsMessageType {
  Start = 'start',
  Response = 'response',
  RequestMessageKey = 'request message key',
  MessageKey = 'message key',
  HealthCheck = 'health check',
  HealthCheckOk = 'health check ok',
}

export interface FinchRequestMessageKey {
  type: FinchDevToolsMessageType.RequestMessageKey;
}

export interface FinchRequestHealthCheck {
  type: FinchDevToolsMessageType.HealthCheck;
}

export type FinchDevtoolsIncomingMessage =
  | FinchRequestMessageKey
  | FinchRequestHealthCheck;

export type AnyFinchMessage = (
  | FinchDevtoolsIncomingMessage
  | FinchMessage<unknown>
) & {
  id: string;
};

export type FinchMessageHandler = (
  message: AnyFinchMessage,
  sender: chrome.runtime.MessageSender | browser.runtime.MessageSender,
) => Promise<object>;

export interface FinchConnection {
  onStart(): () => void;
  addMessageListener(listener: FinchMessageHandler): void;
  type: FinchConnectionType;
}
