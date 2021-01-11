import { DocumentNode } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import browser from "webextension-polyfill";

export enum TanagerMessageKey {
  Generic = "Tanager-message",
}

export enum TanagerMessageSource {
  Internal = "internal",
  Message = "message",
  ExternalMessage = "external-message",
}

export type GenericVariables = { [key: string]: any };
export type TanagerContextObj = {
  source: TanagerMessageSource;
  sender?: browser.runtime.MessageSender;
  [key: string]: any;
};
export type TanagerContext =
  | TanagerContextObj
  | ((obj: TanagerContextObj) => TanagerContextObj);

type MakeExecSchemaOptions = Parameters<typeof makeExecutableSchema>[0];

export type TanagerApiOptions = {
  context?: TanagerContext;
  attachMessages?: boolean;
  attachExternalMessages?: boolean;
  typeDefs: MakeExecSchemaOptions["typeDefs"] | DocumentNode[];
} & MakeExecSchemaOptions;

export interface TanagerMessage<T extends GenericVariables = {}> {
  type?: TanagerMessageKey.Generic;
  query?: string | DocumentNode;
  variables?: T;
}

export interface TanagerQueryOptions {
  id?: string;
  port?: browser.runtime.Port;
}
