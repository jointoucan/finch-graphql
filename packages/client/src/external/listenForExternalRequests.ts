import { getExtensionId } from '@finch-graphql/browser-polyfill';
import { GraphQLFormattedError } from 'graphql';
import { FinchClient } from '../client/FinchClient';
import { FinchDocumentEventNames, FinchRequestEvent } from './types';

export interface ExternalRequestOptions {
  client: FinchClient;
}

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
 * listenForExternalRequests is a method that should be called in a content script that would like to
 * open up communication with the extension. This communication is done via postMessage. This works for clients
 * that do not support external messaging and need to communicate through postMessage.
 *
 * All communication though the client is sent as a mutation this is to avoid cache if the client
 * is mis configured or reused with a content script.
 *
 * This method will also attach a **data-finch-listener** attribute on
 * the body element to be able to known the event bound.
 *
 *
 * @todo support exportFunction or cloneInto on Firefox.
 * @param {FinchClient} options.client The FinchClient instance to use for the communication
 * @returns a method that cleans up the connection to postMessage and the listener attribute
 */
export const listenForExternalRequests = ({
  client,
}: ExternalRequestOptions) => {
  if (!client) {
    throw new Error('listenForExternalRequests requires a client to be passed');
  }
  const onMessage = async (event: FinchRequestEvent) => {
    if (
      !event.data.type ||
      event.data.type !== FinchDocumentEventNames.Request ||
      event.data.extensionId !== getExtensionId()
    ) {
      return true;
    }
    // Client uses mutations on the client to avoid and cache configuration since mutations are not cached
    const resp = await client.mutate(event.data.query, event.data.variables, {
      external: true,
    });
    sendResponse(event.data.requestId, resp.data, resp.errors);
  };
  window.addEventListener('message', onMessage);
  document.body.setAttribute('data-finch-listener', `${Date.now()}`);
  return () => {
    window.removeEventListener('message', onMessage);
    document.body.removeAttribute('data-finch-listener');
  };
};
