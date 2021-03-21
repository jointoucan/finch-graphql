import { queryApi } from '../client';
import { FinchQueryOptions } from '../types';
import { createResponseEvent } from './createEvents';
import { FinchRequestEvent, FinchDocumentEventNames } from './types';

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
    const resp = await queryApi(event.detail.query, event.detail.variables, {
      ...options,
      external: true,
    });
    const responseEvent = createResponseEvent(
      event.detail.requestId,
      resp.data,
      resp.errors,
    );
    document.dispatchEvent(responseEvent);
  };
  document.addEventListener(FinchDocumentEventNames.Request, onMessage);
  document.body.setAttribute('data-finch-listener', `${Date.now()}`);
  return () => {
    document.removeEventListener(FinchDocumentEventNames.Request, onMessage);
    document.body.removeAttribute('data-finch-listener');
  };
};
