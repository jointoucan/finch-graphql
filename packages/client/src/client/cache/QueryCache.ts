import { DocumentNode, print } from 'graphql';
import { Observable } from './Observable';
import {
  FinchCache,
  FinchQueryObservable,
  FinchQueryResults,
  FinchCacheStatus,
} from '../types';

type Cache = Map<string, FinchQueryObservable<unknown>>;
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
  store: Cache;

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
    this.store = options.hydrate ?? new Map();
  }

  setCache<Query extends unknown>(
    doc: DocumentNode,
    variables: any,
    result: FinchQueryResults<Query>,
  ) {
    const key = QueryCache.serializeQuery(doc, variables);
    this.setCacheKey<Query>(key, result);
  }

  getCache<Query extends unknown>(doc: DocumentNode, variables: any) {
    const key = QueryCache.serializeQuery(doc, variables);
    let cache = this.store.get(key) as FinchQueryObservable<Query> | undefined;
    if (!cache) {
      cache = new Observable<FinchQueryResults<Query>>({
        data: undefined,
        errors: undefined,
        loading: false,
        cacheStatus: FinchCacheStatus.Unknown,
      });
      this.store.set(key, cache);
    }
    return cache;
  }

  private setCacheKey<Query extends unknown>(
    key: string,
    value: FinchQueryResults<Query>,
  ) {
    const cache =
      this.store.get(key) ?? new Observable<FinchQueryResults<Query>>(value);
    cache.update(value);
  }
}
