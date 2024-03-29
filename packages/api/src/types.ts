import { DocumentNode, ExecutionResult, GraphQLError } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { applyMiddleware } from 'graphql-middleware';
import { FinchConnection } from '@finch-graphql/types';

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
  typeDefs: MakeExecSchemaOptions['typeDefs'] | DocumentNode[];
  messageKey?: string;
  messagePortName?: string;
  onQueryResponse?: (meta: QueryResponseMeta) => void;
  disableIntrospection?: boolean;
  validationRules?: Array<any>;
  middleware?: Array<Parameters<typeof applyMiddleware>[1]>;
  disableDevtools?: boolean;
  connection?: FinchConnection;
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
}

export interface FinchExecutionResults<Query> {
  data?: Query;
  readonly errors?: GraphQLError[];
}
