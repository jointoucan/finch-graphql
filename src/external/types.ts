import { DocumentNode, GraphQLFormattedError } from 'graphql';

export enum FinchDocumentEventNames {
  Request = 'finch-document-request-event',
  Response = 'finch-document-response-event',
}

export interface FinchRequestEventProps {
  query: DocumentNode | string;
  variables?: any;
  requestId: string;
  extensionId: string;
}

export type FinchRequestEvent = CustomEvent<FinchRequestEventProps>;

export interface FinchResponseEventProps {
  data: any;
  errors?: Array<GraphQLFormattedError>;
  requestId: string;
}

export type FinchResponseEvent = CustomEvent<FinchResponseEventProps>;
