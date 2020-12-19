import { makeExecutableSchema } from '@graphql-tools/schema';

export enum TangerMessageKey {
  Generic = 'Tanger-message'
}

export enum TangerMessageSource {
  Internal = 'internal',
  Message = 'message',
  ExternalMessage = 'external-message',
}

export type GenericVariables = { [key: string]: any };
export type TangerContextObj = { [key: string]: any }
export type TangerContext = TangerContextObj | ((obj: TangerContextObj) => TangerContextObj)

export type TangerApiOptions = { 
  context?: TangerContext
  attachMessages?: boolean
  attachExternalMessages?: boolean
} & Parameters<typeof makeExecutableSchema>[0];

export interface TangerMessage<T extends GenericVariables = {}> {
  type?: TangerMessageKey.Generic;
  query?: string;
  variables?: T;
}
