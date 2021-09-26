import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import { FinchCache, Listener } from './cache';
import { FinchQueryOptions, GenericVariables } from '@finch-graphql/types';
import { isDocumentNode } from '../utils';
import { queryApi } from './client';

interface FinchClientOptions {
  cache?: FinchCache;
  id?: string;
  messageKey?: string;
}

/**
 * FinchClient is a class that constructs a client that is able to query
 * a FinchApi. A client is able to hold configuration on how the API calls
 * are made and also any query caching.
 */
export class FinchClient {
  private cache: FinchCache | undefined;
  private id: string | undefined;
  private messageKey: string | undefined;

  /**
   *
   * @param options Set of options to configure the client
   * @param options.cache An optional FinchCache instance
   * @param options.id A identifier for the extension to connect to, this is used for external request
   * @param options.messageKey If there is a custom message key this is where you would pass it.
   */
  constructor(options: FinchClientOptions = {}) {
    this.cache = options.cache;
    this.id = options.id;
    this.messageKey = options.messageKey;
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
    const result = await queryApi<Query, Variables>(documentNode, variables, {
      id: this.id,
      messageKey: this.messageKey,
      ...options,
    });

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
    const result = await queryApi<Query, Variables>(documentNode, variables, {
      id: this.id,
      messageKey: this.messageKey,
      ...options,
    });

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
