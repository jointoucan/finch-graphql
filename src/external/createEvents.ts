import { DocumentNode, GraphQLFormattedError } from 'graphql';
import { v4 } from 'uuid';
import {
  FinchRequestEventProps,
  FinchDocumentEventNames,
  FinchResponseEventProps,
} from './types';

/**
 * createRequestEvent creates a event that will be consumed by the extension
 * @param query A graphql Document Node
 * @param variables If the query or mutation needs variables they can be passed here
 * @returns A CustomEvent with the graphQL query added to it, and a requestId
 */
export const createRequestEvent = (
  query: DocumentNode | string,
  variables?: any,
) => {
  return new CustomEvent<FinchRequestEventProps>(
    FinchDocumentEventNames.Request,
    {
      detail: { query, variables, requestId: v4() },
    },
  );
};

/**
 * createResponseEvent creates an event that is the response to the request event.
 * @param requestId A unique identifier that comes from the initial request event.
 * @param data The response data from graphQL
 * @param errors An array of graphQL errors if there was any
 * @returns The custom event with all the data added to it.
 */
export const createResponseEvent = (
  requestId: string,
  data: any,
  errors?: Array<GraphQLFormattedError>,
) => {
  return new CustomEvent<FinchResponseEventProps>(
    FinchDocumentEventNames.Response,
    {
      detail: { data, errors, requestId },
    },
  );
};
