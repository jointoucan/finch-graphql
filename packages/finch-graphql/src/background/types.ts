import { DocumentNode, GraphQLFormattedError } from 'graphql';
import { FinchContextObj } from '../types';

export enum FinchDevToolsMessageType {
  Start = 'start',
  Response = 'response',
}

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
