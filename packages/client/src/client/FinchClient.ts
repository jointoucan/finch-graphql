import { DocumentNode, GraphQLFormattedError } from 'graphql';
import gql from 'graphql-tag';
import { FinchCache, Listener } from './cache';
import {
  FinchDefaultPortName,
  FinchQueryOptions,
  GenericVariables,
} from '@finch-graphql/types';
import { isDocumentNode } from '../utils';
import { messageCreator, queryApi } from './client';
import { connectPort } from '@finch-graphql/browser-polyfill';
import { v4 } from 'uuid';

interface FinchClientOptions {
  cache?: FinchCache;
  id?: string;
  messageKey?: string;
  portName?: string;
  useMessages?: boolean;
}

enum FinchClientStatus {
  Disconnected = 'disconnected',
  Connected = 'connected',
  Connecting = 'connecting',
  Idle = 'idle',
}

const DEFAULT_TIMEOUT = 1000;

/**
 * FinchClient is a class that constructs a client that is able to query
 * a FinchApi. A client is able to hold configuration on how the API calls
 * are made and also any query caching.
 */
export class FinchClient {
  private cache: FinchCache | undefined;
  private id: string | undefined;
  private messageKey: string | undefined;
  private port: browser.runtime.Port | chrome.runtime.Port | null;
  private portName = FinchDefaultPortName;
  private portReconnectTimeout = 1000;
  private useMessages: boolean;
  public status = FinchClientStatus.Idle;

  /**
   *
   * @param options Set of options to configure the client
   * @param options.cache An optional FinchCache instance
   * @param options.id A identifier for the extension to connect to, this is used for external request
   * @param options.messageKey If there is a custom message key this is where you would pass it.
   * @param options.disablePort Disabled the port connection
   */
  constructor(options: FinchClientOptions = {}) {
    this.cache = options.cache;
    this.id = options.id;
    this.messageKey = options.messageKey;
    this.portName = options.portName || this.portName;
    this.useMessages = options.useMessages ?? false;
  }

  start() {
    if (this.status !== FinchClientStatus.Idle) {
      return;
    }
    if (this.useMessages) {
      this.status = FinchClientStatus.Connected;
    } else {
      this.status = FinchClientStatus.Connecting;
      this.connectPort();
    }
  }

  stop() {
    this.port.disconnect();
    // Timeout is to let the event fire before setting state
    setTimeout(() => {
      this.status = FinchClientStatus.Idle;
      clearTimeout(this.portReconnectTimeout);
    }, 0);
  }

  connectPort() {
    const port = connectPort({
      extensionId: this.id,
      connectInfo: { name: this.portName },
    });
    this.port = port;
    this.status = FinchClientStatus.Connected;

    port.onDisconnect.addListener(() => {
      this.status = FinchClientStatus.Disconnected;
      this.portReconnectTimeout = window.setTimeout(() => {
        if (this.status === FinchClientStatus.Idle) {
          return;
        }
        console.warn(`Reattempting reconnect to background script`);
        this.connectPort();
      }, DEFAULT_TIMEOUT);
      this.port = null;
    });
  }

  private queryApiViaPort<
    Query extends {} = {},
    Variables extends GenericVariables = {}
  >(
    query: string | DocumentNode,
    variables?: Variables,
    options: FinchQueryOptions = {},
  ): Promise<{
    id: string;
    data: Query | null;
    errors?: GraphQLFormattedError[];
  }> {
    return new Promise(resolve => {
      const messageId = v4();
      const decoratedMessage = messageCreator(
        query,
        variables,
        options.messageKey,
        !!this.id,
      );
      this.port?.postMessage({ id: messageId, ...decoratedMessage });
      // TODO: add a timeout for the request
      const onMessage = (response: {
        id: string;
        data: Query | null;
        errors?: GraphQLFormattedError[];
      }) => {
        if (response.id === messageId) {
          this.port?.onMessage.removeListener(onMessage);
          resolve(response);
        }
      };

      this.port?.onMessage.addListener(onMessage);
    });
  }

  async queryApi<
    Query extends {} = {},
    Variables extends GenericVariables = {}
  >(
    query: string | DocumentNode,
    variables?: Variables,
    options: FinchQueryOptions = {},
  ): Promise<{
    id?: string;
    data: Query | null;
    errors?: GraphQLFormattedError[];
  }> {
    if (this.useMessages) {
      return queryApi<Query, Variables>(query, variables, options);
    }
    return this.queryApiViaPort<Query, Variables>(query, variables, options);
  }

  /**
   * query queries the Api and returns a properly typed response. This
   * also has the side effect of setting cache and updating any queries that
   * subscribe to the cache.
   *
   * @param query A Document node or string to query the api
   * @param variables Variables for this query
   * @param options Any additional options for the query
   * @returns The result of the query
   */
  async query<Query extends {} = {}, Variables extends GenericVariables = {}>(
    query: string | DocumentNode,
    variables?: Variables,
    options: FinchQueryOptions = {},
  ) {
    const documentNode = isDocumentNode(query) ? query : gql(query);
    const result = await this.queryApi<Query, Variables>(
      documentNode,
      variables,
      {
        id: this.id,
        messageKey: this.messageKey,
        ...options,
      },
    );

    if (this.cache && result?.data) {
      this.cache.setCache(documentNode, variables, result.data);
    }
    return result;
  }

  /**
   * mutate queries the Api and returns a properly typed response. It is intended
   * that this is used for mutations.
   *
   * @param mutation A Document node or string to query the api
   * @param variables Variables for this query
   * @param options Any additional options for the query
   * @returns The result of the query
   */
  async mutate<Query extends {} = {}, Variables extends GenericVariables = {}>(
    mutation: string | DocumentNode,
    variables?: Variables,
    options: FinchQueryOptions = {},
  ) {
    const documentNode = isDocumentNode(mutation) ? mutation : gql(mutation);
    const result = await this.queryApi<Query, Variables>(
      documentNode,
      variables,
      {
        id: this.id,
        messageKey: this.messageKey,
        ...options,
      },
    );

    return result;
  }

  /**
   * If cache is set this method allows other queries to subscribe to updates of that
   * query. This is mainly used in the useQuery hook.
   * @param query A Document node or string to query the api
   * @param variables Variables for this query
   * @param listener A Function that is called when the cache is updated
   * @returns A function that unsubscribes from the query.
   */
  subscribe<Query extends unknown>(
    query: string | DocumentNode,
    variables: unknown,
    listener: Listener<Query>,
  ) {
    if (!this.cache) {
      return () => {};
    }
    const documentNode = isDocumentNode(query) ? query : gql(query);
    return this.cache.subscribe<Query>(documentNode, variables, listener);
  }
}
