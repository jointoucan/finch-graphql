import { queryApi } from "../client";
import { DocumentNode, GraphQLFormattedError } from "graphql";
import { useState, useEffect, useCallback, useRef } from "react";
import { useExtension } from "./ExtensionProvider";

type MutationError = GraphQLFormattedError | Error;
type Response<T> = { data: T | null; errors?: GraphQLFormattedError[] } | null;

export const useMutation = <T, V>(
  query: DocumentNode
): [
  (variables: V) => Promise<Response<T>>,
  {
    data: T | null;
    loading: Boolean;
    error?: MutationError;
  }
] => {
  const { id } = useExtension();
  const mounted = useRef(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<MutationError | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const makeMutation = useCallback(
    async (argVars: V) => {
      setLoading(true);
      let resp: Response<T> | null = null;
      try {
        resp = await queryApi<T, V>(query, argVars, id);
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
    [query]
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
