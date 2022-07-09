import { DocumentNode, GraphQLFormattedError } from 'graphql';
import { useState, useEffect, useCallback, useRef } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useFinchClient } from './FinchProvider';

interface BackgroundQueryOptions<Variables> {
  variables?: Variables;
  skip?: Boolean;
  pollInterval?: number;
  poll?: boolean;
  timeout?: number;
}

type QueryError = GraphQLFormattedError | Error;

/**
 * useQuery is a hook that allows you to easily fetch data from a Finch GraphQL
 * client in React.
 * @param query GraphQL query to run against Finch server
 * @param options a set of options to configure the query
 * @param options.variables a set of variables to pass to the query
 * @param options.skip if true, the query will not be run until true
 * @param options.pollInterval [optional] how often to poll the server for updates
 * @param options.poll [optional] not needed for simple polling queries but allows you turn off polling on mount
 * @param options.timeout [optional] how long to wait for a response from the server before timing out, this is used only for port based connections overrides the global timeout
 * @returns the response, and loading states of the query.
 */
export const useQuery = <Query, Variables>(
  query: DocumentNode,
  {
    skip,
    variables,
    pollInterval: passedPollInterval = 0,
    poll,
    timeout,
  }: BackgroundQueryOptions<Variables> = {},
) => {
  const { client } = useFinchClient();
  const mounted = useRef(true);
  const [data, setData] = useState<Query | null>(null);
  const [error, setError] = useState<QueryError | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [shouldPoll, setShouldPoll] = useState<boolean>(
    () => poll ?? !!passedPollInterval,
  );
  const [pollInterval, setPollInterval] = useState<number>(passedPollInterval);

  /**
   * makeQuery is a helper function that runs the query against the Finch client
   * and sets the state of the query.
   *
   * It will clear out old cache, and will also cancel the cache update if a new query is
   * made.
   *
   * @returns a function that will stop cache from being updated with the result of the promise.
   */
  const makeQuery = useCallback(
    (argVars?: Variables) => {
      let cancelled = false;
      const queryRequest = {
        cancel: () => {
          cancelled = true;
        },
        request: client
          .query<Query, Variables>(
            query,
            // @ts-ignore variables are kinda weird
            argVars ?? variables ?? {},
            { timeout },
          )
          .then(resp => {
            if (resp.data && mounted.current && !cancelled) {
              setData(resp.data);
            }
            if (resp.errors && resp.errors.length && !cancelled) {
              setError(resp.errors[0]);
            }
          })
          .catch(e => {
            if (mounted.current && !cancelled) {
              setError(e);
            }
          })
          .finally(() => {
            if (mounted.current && !cancelled) {
              setLoading(false);
            }
          }),
        response: null,
      };

      // Clear out old error cache
      setError(null);

      return queryRequest;
    },
    [query, variables],
  );

  /**
   * startPolling turns on polling for the query. This is useful for
   * queries, that you want to keep up to date, but do not have things like
   * subscriptions setup.
   *
   * You do not need to call start polling if you pass a pollInterval to
   * useQuery as an initial value.
   */
  const startPolling = useCallback(() => {
    setShouldPoll(true);
  }, []);

  /**
   * stopPolling stops the polling from making queries. This is useful
   * when you want to poll until you have a certain result but then turn off
   * the polling.
   */
  const stopPolling = useCallback(() => {
    setShouldPoll(false);
  }, []);

  /**
   * refetch is a small methods that allows you to refetch the query.
   */
  const refetch = useCallback(
    (overrideVariables?: Variables) => {
      return makeQuery(overrideVariables).request;
    },
    [makeQuery],
  );

  /**
   * This effect handles the initial query and updating the query
   * if the variables or query changes.
   */
  useDeepCompareEffect(() => {
    const unsubscribe = client.subscribe<Query>(
      query,
      variables,
      updatedData => {
        setData(updatedData);
      },
    );
    let cancelQuery = () => {};

    if (!skip) {
      setLoading(true);
      cancelQuery = makeQuery().cancel;
    }
    return () => {
      cancelQuery();
      unsubscribe();
    };
  }, [query, skip, variables]);

  /**
   * This effect handles polling the query if the pollInterval is set,
   * this is dependent off of two states, shouldPoll and pollInterval.
   * shouldPoll allows us to turn off and on polling when needed.
   */
  useEffect(() => {
    let timer: number | undefined;
    if (shouldPoll && pollInterval) {
      timer = window.setInterval(async () => {
        await makeQuery();
      }, pollInterval);
    }
    return () => {
      window.clearInterval(timer);
    };
  }, [shouldPoll, pollInterval]);

  /**
   * This effect handles updating the poll interval if the pollInterval
   * is updated.
   */
  useEffect(() => {
    if (pollInterval !== passedPollInterval) {
      setPollInterval(passedPollInterval);
    }
  }, [passedPollInterval]);

  /**
   * This effect handles the mounted ref, to make sure we dont update state after the
   * hook is unmounted.
   */
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
    refetch,
    startPolling,
    stopPolling,
  };
};
