import { FinchConnection, FinchConnectionType } from '@finch-graphql/types';

/**
 * FinchNullConnection allows you to turn off any auto connections.
 * Use this when manually connecting messages to the client.
 */
export class FinchNullConnection implements FinchConnection {
  /**
   * defaults to message connections since this is usually turned off to enable manually connecting.
   */
  public type = FinchConnectionType.Message;
  /**
   * onStart interfaces with the FinchApi
   **/
  onStart() {
    return () => {};
  }
  /**
   * addMessageListener interfaces with the FinchApi
   **/
  addMessageListener() {}
}
