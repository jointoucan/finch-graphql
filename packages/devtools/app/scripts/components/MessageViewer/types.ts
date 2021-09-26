import { FinchDevToolsMessageType } from '@finch-graphql/api';
import { DocumentNode, GraphQLFormattedError } from 'graphql';
import { FinchContextObj } from '@finch-graphql/api';

export type FinchDevtoolsIncomingMessage =
  | {
      type: FinchDevToolsMessageType.Start;
      operationName: string;
      query: DocumentNode;
      variables: unknown;
      initializedAt: number;
      context: FinchContextObj;
      id: string;
    }
  | {
      type: FinchDevToolsMessageType.Response;
      timeTaken: number;
      response: {
        data?: unknown;
        errors?: GraphQLFormattedError[];
      };
      id: string;
    }
  | { type: FinchDevToolsMessageType.MessageKey; messageKey: string };

export type FinchDevtoolsMessage = {
  type: FinchDevToolsMessageType;
  operationName: string;
  query: DocumentNode;
  variables: unknown;
  initializedAt: number;
  context: FinchContextObj;
  id: string;
} & Partial<{
  type: FinchDevToolsMessageType;
  timeTaken: number;
  response: {
    data?: unknown;
    errors?: GraphQLFormattedError[];
  };
  id: string;
}>;
