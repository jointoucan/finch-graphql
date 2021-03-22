/**
 * isListeningOnDocument is a small utility to query the API using document events.
 * @returns A boolean value if Finch is listening on the document.
 */
export const isListeningOnDocument = () => {
  return !!document.body.hasAttribute('data-finch-listener');
};
