import { DocumentNode, GraphQLFormattedError } from 'graphql';
import { Observable } from './Observable';

export enum FinchCacheStatus {
  Fresh = 'fresh',
  Stale = 'stale',
  Unknown = 'unknown',
}

export interface FinchQueryResults<Query extends unknown> {
  data?: Query;
  errors?: Array<GraphQLFormattedError>;
  loading: boolean;
  cacheStatus: FinchCacheStatus;
}

export type FinchQueryObservable<Query extends unknown> = Observable<
  FinchQueryResults<Query>
>;

export interface FinchCache {
  setCache<Query extends unknown>(
    doc: DocumentNode,
    variables: any,
    result: FinchQueryResults<Query>,
  ): void;
  getCache<Query extends unknown>(
    doc: DocumentNode,
    variables: any,
  ): FinchQueryObservable<Query> | undefined;
}
