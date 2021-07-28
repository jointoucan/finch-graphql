import { DocumentNode, GraphQLFormattedError } from 'graphql';
import { v4 } from 'uuid';
import { isListeningOnDocument } from './isListeningOnDocument';
import { FinchDocumentEventNames, FinchResponseEvent } from './types';

const DEFAULT_TIMEOUT = 3000;

interface QueryApiFromDocumentOptions {
  timeout?: number;
  extensionId: string;
}

/**
 * queryApiFromDocument sends a graphQL query through the document and waits
 * for a response to the event.
 *
 * @param query a graphQL document node
 * @param variables the variables to be passed to the query
 * @param options some options to help configure the request
 * @param options.timeout the amount of time in milliseconds to wait for response
 * @returns A promise that resolves to the response of the query
 */
export const queryApiFromDocument = async <
  Query extends {},
  Variables extends any
>(
  query: DocumentNode | string,
  variables?: Variables,
  options?: QueryApiFromDocumentOptions,
): Promise<{ data: Query | null; errors: Array<GraphQLFormattedError> }> => {
  if (!isListeningOnDocument()) {
    return Promise.reject(
      new Error('Finch is not currently listening for messages'),
    );
  }

  const requestId = v4();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Finch request has timed out.'));
      window.removeEventListener('message', onMessage);
    }, options?.timeout ?? DEFAULT_TIMEOUT);
    const onMessage = async (event: FinchResponseEvent) => {
      // Filter out other events that might be coming into the handler
      if (
        !event.data.type ||
        event.data.type !== FinchDocumentEventNames.Response ||
        event.data.requestId !== requestId
      ) {
        return;
      }
      clearTimeout(timer);
      resolve({
        data: event.data.data as Query | null,
        errors: event.data.errors,
      });
      // Unbind after we got a response
      window.removeEventListener('message', onMessage);
    };
    window.addEventListener('message', onMessage);
    window.postMessage(
      {
        type: FinchDocumentEventNames.Request,
        extensionId: options?.extensionId,
        query,
        variables,
        requestId,
      },
      '*',
    );
  });
};
