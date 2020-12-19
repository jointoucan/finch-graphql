import { makeExecutableSchema } from '@graphql-tools/schema';

export enum TanagerMessageKey {
  Generic = 'Tanager-message'
}

export enum TanagerMessageSource {
  Internal = 'internal',
  Message = 'message',
  ExternalMessage = 'external-message',
}

export type GenericVariables = { [key: string]: any };
export type TanagerContextObj = { [key: string]: any }
export type TanagerContext = TanagerContextObj | ((obj: TanagerContextObj) => TanagerContextObj)

export type TanagerApiOptions = { 
  context?: TanagerContext
  attachMessages?: boolean
  attachExternalMessages?: boolean
} & Parameters<typeof makeExecutableSchema>[0];

export interface TanagerMessage<T extends GenericVariables = {}> {
  type?: TanagerMessageKey.Generic;
  query?: string;
  variables?: T;
}
