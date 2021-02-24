import { queryApi } from "../client";
import { DocumentNode, GraphQLFormattedError } from "graphql";
import { useState, useEffect, useCallback, useRef } from "react";
import { useExtension } from "./ExtensionProvider";
import useDeepCompareEffect from "use-deep-compare-effect";

interface BackgroundQueryOptions<Variables> {
  variables?: Variables;
  skip?: Boolean;
}

type QueryError = GraphQLFormattedError | Error;

export const useQuery = <Query, Variables>(
  query: DocumentNode,
  { skip, variables }: BackgroundQueryOptions<Variables> = {}
) => {
  const { id, messageKey } = useExtension();
  const mounted = useRef(true);
  const [data, setData] = useState<Query | null>(null);
  const [error, setError] = useState<QueryError | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const makeQuery = useCallback(
    async (argVars?: Variables) => {
      try {
        const resp = await queryApi<Query, Variables>(
          query,
          // @ts-ignore variables are kinda weird
          argVars ?? variables ?? {},
          { id, messageKey }
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
    [query, variables]
  );

  useDeepCompareEffect(() => {
    if (!skip) {
      setLoading(true);
      makeQuery();
    }
  }, [query, skip, variables]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return {
    data,
    error,
    loading,
    refetch: makeQuery,
  };
};
