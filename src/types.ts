import { DocumentNode } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import browser from "webextension-polyfill";

export enum FinchMessageKey {
  Generic = "Finch-message",
}

export enum FinchMessageSource {
  Internal = "internal",
  Message = "message",
  ExternalMessage = "external-message",
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

export type FinchApiOptions = {
  context?: FinchContext;
  attachMessages?: boolean;
  attachExternalMessages?: boolean;
  typeDefs: MakeExecSchemaOptions["typeDefs"] | DocumentNode[];
} & MakeExecSchemaOptions;

export interface FinchMessage<Variables extends GenericVariables = {}> {
  type?: FinchMessageKey.Generic;
  query?: string | DocumentNode;
  variables?: Variables;
}

export interface FinchQueryOptions {
  id?: string;
  port?: browser.runtime.Port;
}
