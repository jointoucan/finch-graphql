import { DocumentNode, print } from 'graphql';
import { Listener, FinchCache } from './types';

type Cache = Map<string, unknown>;

interface ListenerMap {
  [key: string]: Array<Listener<unknown>>;
}

interface QueryCacheOptions {
  hydrate?: Cache;
}

/**
 * QueryCache is a class that caches queries based on serialization
 * of the query and variable. This implements FinchCache which has getters
 * setters and a way to subscribe to cache updates.
 * @implements FinchCache
 */
export class QueryCache implements FinchCache {
  cache: Cache;
  listeners: ListenerMap;

  /**
   * serializeQuery is a static method on the the QueryCache class that allow
   * external programs to serialize queries for cache hydration.
   * @param doc GraphQL query
   * @param variables Variable for the query
   * @returns A string if of the serialized query
   */
  static serializeQuery(doc: DocumentNode, variables: any) {
    return `${print(doc)}:${JSON.stringify(variables)}`;
  }

  /**
   * QueryCache constructor has the ability to hydrate the cache
   * this means that if we are able to preload and info we can pass
   * it directly to constructor
   * @param options.hydrate A Map with the serialized query cache.
   */
  constructor(options: QueryCacheOptions = {}) {
    this.cache = options.hydrate ?? new Map();
    this.listeners = {};
  }

  subscribe<Query extends unknown>(
    doc: DocumentNode,
    variables: any,
    listener: Listener<Query>,
  ) {
    const key = QueryCache.serializeQuery(doc, variables);
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
    const key = QueryCache.serializeQuery(doc, variables);
    this.setCacheKey<Query>(key, result);
  }

  getCache<Query extends unknown>(doc: DocumentNode, variables: any) {
    const key = QueryCache.serializeQuery(doc, variables);
    return this.cache.get(key) as Query | undefined;
  }

  private setCacheKey<Query extends unknown>(key: string, value: Query) {
    const listeners = this.listeners[key] ?? [];
    this.cache.set(key, value);
    listeners.forEach(fn => {
      fn(value);
    });
  }
}
