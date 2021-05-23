/**
 * QueryCache will be a client that will cache queries
 * this makes it simple to be able to share information between queries without
 * having to refetch information in other hooks.
 *
 * - We will need to serialize queries.
 * - A way to turn on this, without it being on by default.
 * - A way to notify hooks that something has updated.
 */

import { DocumentNode, print } from 'graphql';
import { Listener, FinchCache } from './types';

type Cache = Map<string, unknown>;

interface ListenerMap {
  [key: string]: Array<Listener<unknown>>;
}

interface QueryCacheOptions {
  hydrate?: Cache;
}

const serializeQuery = (doc: DocumentNode, variables: any) => {
  return `${print(doc)}:${JSON.stringify(variables)}`;
};

export class QueryCache implements FinchCache {
  cache: Cache;
  listeners: ListenerMap;

  constructor(options: QueryCacheOptions = {}) {
    this.cache = options.hydrate ?? new Map();
  }

  subscribe<Query extends unknown>(
    doc: DocumentNode,
    variables: any,
    listener: Listener<Query>,
  ) {
    const key = serializeQuery(doc, variables);
    if (typeof this.listeners[key] === 'undefined') {
      this.listeners[key] = [];
    }
    this.listeners[key].push(listener);
    return () => {
      const index = this.listeners[key].indexOf(listener);
      this.listeners[key] = [
        ...this.listeners[key].slice(0, index),
        ...this.listeners[key].slice(index + 1),
      ];
    };
  }

  setCache<Query extends unknown>(
    doc: DocumentNode,
    variables: any,
    result: Query,
  ) {
    const key = serializeQuery(doc, variables);
    this.setCacheKey<Query>(key, result);
  }

  private setCacheKey<Query extends unknown>(key: string, value: Query) {
    const listeners = this.listeners[key];
    this.cache.set(key, value);
    listeners.forEach(fn => {
      fn(value);
    });
  }

  getCache<Query extends unknown>(doc: DocumentNode, variables: any) {
    const key = serializeQuery(doc, variables);
    return this.cache.get(key) as Query | undefined;
  }
}
