import { DocumentNode, GraphQLFormattedError } from 'graphql';

export enum FinchDocumentEventNames {
  Request = 'finch-document-request-event',
  Response = 'finch-document-response-event',
}

export interface FinchRequestEventProps {
  type: FinchDocumentEventNames;
  query: DocumentNode | string;
  variables?: any;
  requestId: string;
  extensionId: string;
}

export interface FinchRequestEvent extends MessageEvent {
  data: FinchRequestEventProps;
}

export interface FinchResponseEventProps {
  type: FinchDocumentEventNames;
  data: any;
  errors?: Array<GraphQLFormattedError>;
  requestId: string;
}

export interface FinchResponseEvent extends MessageEvent {
  data: FinchResponseEventProps;
}
