import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';
import { QueryCache, Listener } from './cache';
import { FinchQueryOptions, GenericVariables } from '../types';
import { isDocumentNode } from '../utils';
import { queryApi } from './client';

interface FinchClientOptions {
  cache?: QueryCache;
  id?: string;
  messageKey?: string;
}

export class FinchClient {
  private cache: QueryCache | undefined;
  private id: string | undefined;
  private messageKey: string | undefined;

  constructor(options: FinchClientOptions) {
    this.cache = options.cache;
    this.id = options.id;
    this.messageKey = options.messageKey;
  }

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

    if (this.cache) {
      this.cache.setQueryCache(documentNode, variables, result);
    }
    return result;
  }

  subscribe<Query extends unknown>(
    query: string | DocumentNode,
    variables: unknown,
    listener: Listener<Query>,
  ) {
    const documentNode = isDocumentNode(query) ? query : gql(query);
    if (!this.cache) {
      return () => {};
    }
    return this.cache.subscribe<Query>(documentNode, variables, listener);
  }
}
