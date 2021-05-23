import { DocumentNode } from 'graphql';

export type Listener<Query extends unknown> = (updateInfo: Query) => void;

export interface CacheConstructor {
  setCache<Query extends unknown>(
    doc: DocumentNode,
    variables: any,
    result: Query,
  ): void;
  getCache<Query extends unknown>(
    doc: DocumentNode,
    variables: any,
  ): Query | undefined;
  subscribe<Query extends unknown>(
    doc: DocumentNode,
    variables: any,
    listener: Listener<Query>,
  );
}
