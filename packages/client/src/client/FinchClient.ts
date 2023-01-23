import { DocumentNode, GraphQLFormattedError } from 'graphql';
import gql from 'graphql-tag';
import { Awaited, FinchCachePolicy } from '@finch-graphql/types';
import { QueryCache } from './cache';
import {
  FinchDefaultPortName,
  FinchQueryOptions,
  GenericVariables,
} from '@finch-graphql/types';
import { isDocumentNode } from '../utils';
import { messageCreator, queryApi } from './client';
import { connectPort } from '@finch-graphql/browser-polyfill';
import { v4 } from 'uuid';
import { FinchCacheStatus, FinchQueryObservable } from './types';

interface FinchClientOptions {
  cache?: QueryCache;
  id?: string;
  messageKey?: string;
  portName?: string;
  useMessages?: boolean;
  messageTimeout?: number;
  autoStart?: boolean;
  maxPortTimeoutCount?: number;
  cachePolicy?: FinchCachePolicy;
}

export enum FinchClientStatus {
  Disconnected = 'disconnected',
  Connected = 'connected',
  Connecting = 'connecting',
  Idle = 'idle',
}

/**
 * FinchClient is a class that constructs a client that is able to query
 * a FinchApi. A client is able to hold configuration on how the API calls
 * are made and also any query caching.
 */
export class FinchClient {
  private id: string | undefined;
  private messageKey: string | undefined;
  private port: browser.runtime.Port | chrome.runtime.Port | null;
  private portName = FinchDefaultPortName;
  private portReconnectTimeout = 1000;
  private useMessages: boolean;
  private messageTimeout = 5000;
  private portTimeoutCount = 0;
  private maxPortTimeoutCount = 10;
  private cancellableQueries: Set<() => void> = new Set();
  private subscriptions: WeakMap<
    FinchQueryObservable<unknown>,
    () => void
  > = new WeakMap();
  private cachePolicy: FinchCachePolicy;
  public status = FinchClientStatus.Idle;
  public cache: QueryCache = new QueryCache();

  /**
   *
   * @param options Set of options to configure the client
   * @param options.cache An optional FinchCache instance
   * @param options.id A identifier for the extension to connect to, this is used for external request
   * @param options.messageKey If there is a custom message key this is where you would pass it.
   * @param options.disablePort Disabled the port connection
   * @param options.messageTimeout The timeout for the message
   */
  constructor({
    cache,
    id,
    messageKey,
    portName,
    useMessages,
    messageTimeout,
    autoStart = true,
    maxPortTimeoutCount = 10,
    cachePolicy = FinchCachePolicy.CacheFirst,
  }: FinchClientOptions = {}) {
    if (cache) {
      this.cache = cache;
    }
    this.id = id;
    this.messageKey = messageKey;
    this.portName = portName || this.portName;
    this.useMessages = useMessages ?? false;
    this.messageTimeout = messageTimeout ?? this.messageTimeout;
    this.maxPortTimeoutCount = maxPortTimeoutCount;
    this.cachePolicy = cachePolicy;
    if (autoStart) {
      this.start();
    }
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
    this.port?.disconnect();
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
    this.status = port
      ? FinchClientStatus.Connected
      : FinchClientStatus.Disconnected;

    port?.onDisconnect.addListener(() => {
      this.status = FinchClientStatus.Disconnected;
      this.portReconnectTimeout = window.setTimeout(() => {
        if (this.status === FinchClientStatus.Idle) {
          return;
        }
        console.warn(`Reattempting reconnect to background script`);
        this.connectPort();
      }, this.portReconnectTimeout);
      this.port = null;
    });
  }

  /**
   * queryApiViaPort will make a graphQL query to the background script via a [port](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port).
   * This method has a timeout for messages build into it, because if a port is disconnected
   * the would be no way to get a response without a timeout. There is also a max number of
   * timeouts ( 10 by default ) that can trigger the port to attempt a reconnection.
   *
   * @param query A Document node or string to query the api
   * @param variables Variables for this query
   * @param options Any additional options for the query
   * @returns The result of the query
   */
  private queryApiViaPort<
    Query extends {} = {},
    Variables extends GenericVariables = {}
  >(
    query: string | DocumentNode,
    variables?: Variables,
    options: FinchQueryOptions = {},
  ): Promise<{
    data: Query | null;
    errors?: GraphQLFormattedError[];
  }> {
    let cancelled = false;
    return new Promise(resolve => {
      const messageId = v4();
      const decoratedMessage = messageCreator(
        query,
        variables,
        options.messageKey ?? this.messageKey,
        !!this.id,
      );
      const cancel = () => {
        cancelled = true;
        this.cancellableQueries.delete(cancel);
        resolve({
          data: null,
          errors: [
            {
              message: `Promise cancelled`,
            },
          ],
        });
      };
      this.cancellableQueries.add(cancel);
      this.port?.postMessage({ id: messageId, ...decoratedMessage });

      const requestTimeout = setTimeout(() => {
        if (cancelled) {
          return;
        }
        this.portTimeoutCount += 1;
        this.cancellableQueries.delete(cancel);
        resolve({
          data: null,
          errors: [
            {
              message: `Timed out waiting for response from background script`,
            },
          ],
        });
        if (this.portTimeoutCount >= this.maxPortTimeoutCount) {
          Array.from(this.cancellableQueries.values()).forEach(cancelQuery =>
            cancelQuery(),
          );
          this.port?.disconnect();
          this.connectPort();
        }
      }, options.timeout ?? this.messageTimeout);

      const onMessage = ({
        id,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        external,
        ...response
      }: {
        id: string;
        external: boolean;
        data: Query | null;
        errors?: GraphQLFormattedError[];
      }) => {
        if (id === messageId) {
          clearTimeout(requestTimeout);
          this.port?.onMessage.removeListener(onMessage);
          if (!cancelled) {
            this.cancellableQueries.delete(cancel);
            resolve(response);
          }
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
    let cache = this.cache?.getCache(documentNode, variables) as
      | FinchQueryObservable<Query>
      | undefined;
    const respondWithCache =
      (options.cachePolicy ?? this.cachePolicy) === FinchCachePolicy.CacheFirst;

    const snapshot = cache?.getSnapshot();

    if (snapshot.loading) {
      return snapshot;
    }

    if (!snapshot.data && !snapshot.errors && !snapshot.loading) {
      cache.update({
        ...snapshot,
        cacheStatus: FinchCacheStatus.Fresh,
        loading: true,
      });
    }

    const pendingFetch = new Promise(async resolve => {
      let result: Awaited<Omit<typeof snapshot, 'cacheStatus' | 'loading'>>;
      try {
        result = await this.queryApi<Query, Variables>(
          documentNode,
          variables,
          {
            id: this.id,
            messageKey: this.messageKey,
            ...options,
          },
        );

        if (this.cache) {
          this.cache.setCache(documentNode, variables, {
            data: result?.data ?? snapshot.data,
            errors: result?.errors,
            loading: false,
            cacheStatus: FinchCacheStatus.Fresh,
          });
          this.queryLifecycleManager(documentNode, variables);

          resolve(result);
          return;
        }
      } catch (e) {
        result = {
          data: snapshot?.data,
          errors: [e],
        };
        if (this.cache) {
          this.cache.setCache(documentNode, variables, {
            data: snapshot.data,
            errors: [e],
            loading: false,
            cacheStatus: FinchCacheStatus.Fresh,
          });
        }
      }
      resolve(result);
    });

    if (respondWithCache && snapshot.data && !snapshot.errors) {
      return snapshot;
    }
    return pendingFetch;
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
  subscribe<Query extends DocumentNode>(
    query: Query,
    variables: unknown,
    listener: () => void,
  ) {
    if (!this.cache) {
      return () => {};
    }
    const documentNode = isDocumentNode(query) ? query : gql(query);
    const cache = this.cache.getCache(documentNode, variables);
    return cache.subscribe(listener);
  }

  /**
   * Query lifecycle manager manages the lifecycle of a query. This is mainly used
   * revalidating queries when the cache is stale.
   * @param query A Document node or string to query the api
   * @param variables Variables for this query
   * @param observable The observable to subscribe to
   */
  private queryLifecycleManager<
    Query extends {} = {},
    Variables extends GenericVariables = {}
  >(query: DocumentNode, variables?: Variables, options?: FinchQueryOptions) {
    const observable = this.cache?.getCache(
      query,
      variables,
    ) as FinchQueryObservable<Query>;
    const unsubscribe = this.subscriptions.get(observable);
    if (unsubscribe) {
      unsubscribe();
    }
    const subscription = observable.subscribe(() => {
      const snapshot = observable.getSnapshot();
      if (snapshot.cacheStatus === FinchCacheStatus.Stale) {
        this.query(query, variables, { timeout: options?.timeout });
      }
    });
    this.subscriptions.set(observable, subscription);
  }
}
