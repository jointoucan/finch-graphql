import { DocumentNode, GraphQLFormattedError } from 'graphql';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFinchClient } from './FinchProvider';

type MutationError = GraphQLFormattedError | Error;
type Response<T> = { data: T | null; errors?: GraphQLFormattedError[] } | null;

export const useMutation = <Query, Variables>(
  query: DocumentNode,
): [
  (variables: Variables) => Promise<Response<Query>>,
  {
    data: Query | null;
    loading: Boolean;
    error?: MutationError;
  },
] => {
  const { client } = useFinchClient();
  const mounted = useRef(true);
  const [data, setData] = useState<Query | null>(null);
  const [error, setError] = useState<MutationError | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const makeMutation = useCallback(
    async (argVars: Variables) => {
      setLoading(true);
      setError(null);
      let resp: Response<Query> | null = null;
      try {
        resp = await client.mutate<Query, Variables>(query, argVars);
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
      return resp;
    },
    [query],
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return [
    makeMutation,
    {
      data,
      error,
      loading,
    },
  ];
};
