import { GraphQLFormattedError } from 'graphql';
import { getExtensionId } from '../browser';
import { queryApi } from '../client';
import { FinchQueryOptions } from '../types';
import { FinchDocumentEventNames, FinchRequestEvent } from './types';

/**
 * sendResponse a method to send a response through the document.
 * @param event the finch request event
 * @param data the data from the graphQL response
 * @param errors the errors from the graphQL response
 */
export const sendResponse = (
  requestId: string,
  data: any,
  errors: Array<GraphQLFormattedError>,
) => {
  window.postMessage(
    {
      type: FinchDocumentEventNames.Response,
      data,
      errors,
      requestId,
    },
    '*',
  );
};

/**
 * listenForDocumentQueries binds to document events so websites can
 * send Finch GraphQL queries and mutations from document events. This
 * depends if you are able to inject into those pages as well.
 *
 * This method will also attach a **data-finch-listener** attribute on
 * the body element to be able to known the event bound.
 *
 * @param options the finch query options that are passed to queryApi method
 * @returns A function that stops listening to the events
 */
export const listenForDocumentQueries = (options?: FinchQueryOptions) => {
  const onMessage = async (event: FinchRequestEvent) => {
    if (
      !event.data.type ||
      event.data.type !== FinchDocumentEventNames.Request ||
      event.data.extensionId !== getExtensionId()
    ) {
      return true;
    }
    const resp = await queryApi(event.data.query, event.data.variables, {
      ...options,
      external: true,
    });
    sendResponse(event.data.requestId, resp.data, resp.errors);
  };
  // document.addEventListener(FinchDocumentEventNames.Request, onMessage);
  window.addEventListener('message', onMessage);
  document.body.setAttribute('data-finch-listener', `${Date.now()}`);
  return () => {
    window.removeEventListener('message', onMessage);
    document.body.removeAttribute('data-finch-listener');
  };
};
