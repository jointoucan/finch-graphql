import { GraphQLFormattedError } from 'graphql';
import { getExtensionId } from '@finch-graphql/browser-polyfill';
import { queryApi } from '../client';
import { FinchQueryOptions } from '@finch-graphql/types';
import { createResponseEvent } from './createEvents';
import { FinchRequestEvent, FinchDocumentEventNames } from './types';

/**
 * sendResponse a method to send a response through the document.
 * @param event the finch request event
 * @param data the data from the graphQL response
 * @param errors the errors from the graphQL response
 */
export const sendResponse = (
  event: FinchRequestEvent,
  data: any,
  errors: Array<GraphQLFormattedError>,
) => {
  document.dispatchEvent(
    createResponseEvent(event.detail.requestId, data, errors),
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
    if (event.detail.extensionId !== getExtensionId()) {
      return true;
    }
    const resp = await queryApi(event.detail.query, event.detail.variables, {
      ...options,
      external: true,
    });
    sendResponse(event, resp.data, resp.errors);
  };
  document.addEventListener(FinchDocumentEventNames.Request, onMessage);
  document.body.setAttribute('data-finch-listener', `${Date.now()}`);
  return () => {
    document.removeEventListener(FinchDocumentEventNames.Request, onMessage);
    document.body.removeAttribute('data-finch-listener');
  };
};
