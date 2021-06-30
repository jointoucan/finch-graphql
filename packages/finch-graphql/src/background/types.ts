import { DocumentNode, GraphQLFormattedError } from 'graphql';
import { FinchContextObj } from '../types';

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

export interface FinchStartMessage {
  type: FinchDevToolsMessageType;
  operationName: string;
  query: DocumentNode;
  variables: unknown;
  initializedAt: number;
  context: FinchContextObj;
  id: string;
}

export interface FinchResponseMessage {
  type: FinchDevToolsMessageType;
  timeTaken: number;
  response: { data?: unknown; errors?: GraphQLFormattedError[] };
  id: string;
}

export interface MessageMeta {
  query: DocumentNode;
  operationName: string | undefined;
  context: FinchContextObj;
  timeTaken: number;
  response: any;
  variables: any;
}
