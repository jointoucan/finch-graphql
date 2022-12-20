import { DocumentNode } from 'graphql';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDeepCompareMemoize } from 'use-deep-compare-effect';
import { useSyncExternalStore } from 'use-sync-external-store/shim';
import { useFinchClient } from './FinchProvider';

interface BackgroundQueryOptions<Variables> {
  variables?: Variables;
  skip?: Boolean;
  pollInterval?: number;
  poll?: boolean;
  timeout?: number;
}

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
    variables: passedVariables,
    pollInterval: passedPollInterval = 0,
    poll,
    timeout,
  }: BackgroundQueryOptions<Variables> = {},
) => {
  const { client } = useFinchClient();
  const [variables, setVariables] = useState(passedVariables);
  const cache = useMemo(() => {
    const queryCache = client.cache.getCache<Query>(query, variables);
    if (!skip) {
      client.query(query, variables, { timeout: timeout });
    }
    return queryCache;
  }, useDeepCompareMemoize([variables, query, skip, timeout]));
  const { data, errors, loading } = useSyncExternalStore(cache.subscribe, () =>
    cache.getSnapshot(),
  );
  const error = errors?.[0];
  const mounted = useRef(true);
  const [shouldPoll, setShouldPoll] = useState<boolean>(
    () => poll ?? !!passedPollInterval,
  );
  const [pollInterval, setPollInterval] = useState<number>(passedPollInterval);

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
      if (overrideVariables) {
        setVariables(overrideVariables);
      }
      return client.query(query, overrideVariables ?? variables, {
        timeout: timeout,
      });
    },
    [client, timeout],
  );

  /**
   * This effect handles polling the query if the pollInterval is set,
   * this is dependent off of two states, shouldPoll and pollInterval.
   * shouldPoll allows us to turn off and on polling when needed.
   */
  useEffect(() => {
    let timer: number | undefined;
    if (shouldPoll && pollInterval) {
      timer = window.setInterval(async () => {
        refetch();
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

  useEffect(() => {
    setVariables(passedVariables);
  }, useDeepCompareMemoize([passedVariables]));

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

  return useMemo(
    () => ({
      data,
      error,
      loading,
      refetch,
      startPolling,
      stopPolling,
    }),
    [data, error, loading, refetch, startPolling, stopPolling],
  );
};
