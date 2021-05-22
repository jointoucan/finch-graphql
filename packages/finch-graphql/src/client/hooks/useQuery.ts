import { DocumentNode, GraphQLFormattedError } from 'graphql';
import { useState, useEffect, useCallback, useRef } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useFinchClient } from './FinchProvider';

interface BackgroundQueryOptions<Variables> {
  variables?: Variables;
  skip?: Boolean;
}

type QueryError = GraphQLFormattedError | Error;

export const useQuery = <Query, Variables>(
  query: DocumentNode,
  { skip, variables }: BackgroundQueryOptions<Variables> = {},
) => {
  const { client } = useFinchClient();
  const mounted = useRef(true);
  const [data, setData] = useState<Query | null>(null);
  const [error, setError] = useState<QueryError | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const makeQuery = useCallback(
    async (argVars?: Variables) => {
      try {
        const resp = await client.query<Query, Variables>(
          query,
          // @ts-ignore variables are kinda weird
          argVars ?? variables ?? {},
        );

        if (resp.data && mounted.current) {
          setData(resp.data);
        }
        if (resp.errors && resp.errors.length) {
          setError(resp.errors[0]);
        }
      } catch (e) {
        if (mounted.current) {
          setError(e);
        }
      } finally {
        if (mounted.current) {
          setLoading(false);
        }
      }
    },
    [query, variables],
  );

  useDeepCompareEffect(() => {
    const unsubscribe = client.subscribe<Query>(
      query,
      variables,
      updatedData => {
        setData(updatedData);
      },
    );
    if (!skip) {
      setLoading(true);
      makeQuery();
    }
    return () => {
      unsubscribe();
    };
  }, [query, skip, variables]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  if (!client) {
    // TODO: add link to docs
    throw new Error(
      'Finch requires you to wrap your "useQuery" hooks in a "Finch provider"',
    );
  }

  return {
    data,
    error,
    loading,
    refetch: makeQuery,
  };
};
