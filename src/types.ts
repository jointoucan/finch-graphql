import { makeExecutableSchema } from '@graphql-tools/schema';

export enum GraphQLMessageKey {
  Generic = 'graphql-message'
}

export enum GraphQLMessageSource {
  Internal = 'internal',
  Message = 'message',
  ExternalMessage = 'external-message',
}

export type GenericVariables = { [key: string]: any };
export type GraphQLContextObj = { [key: string]: any }
export type GraphQLContext = GraphQLContextObj | ((obj: GraphQLContextObj) => GraphQLContextObj)

export type BackgroundGraphQLOptions = { 
  context?: GraphQLContext
  attachMessages?: boolean
  attachExternalMessages?: boolean
} & Parameters<typeof makeExecutableSchema>[0];

export interface GraphQLMessage<T extends GenericVariables = {}> {
  type?: GraphQLMessageKey.Generic;
  query?: string;
  variables?: T;
}
