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
} & MakeExecSchemaOptions;

export interface FinchMessage<Variables extends GenericVariables = {}> {
  type?: FinchMessageKey.Generic | string;
  query?: string | DocumentNode;
  variables?: Variables;
}

export interface FinchQueryOptions {
  id?: string;
  port?: browser.runtime.Port;
  messageKey?: string;
}

export interface FinchExecutionResults<Query> {
  data?: Query;
  readonly errors?: GraphQLError[];
}
