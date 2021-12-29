import { createElement, createContext, FC, useContext } from 'react';
import { FinchClient } from '@finch-graphql/client';

interface FinchProviderProps {
  client: FinchClient;
}

const context = createContext<FinchProviderProps>({
  client: new FinchClient({ autoStart: false }),
});
const { Provider } = context;

export const FinchProvider: FC<FinchProviderProps> = ({ client, children }) => {
  return createElement(Provider, { value: { client }, children });
};

/**
 * useFinchClient is a hook that returns an object with the Finch
 * client in it. This is used internally to make queries in useQuery, and
 * useMutation hooks.
 * @returns ret.client The finch client instance being used
 */
export const useFinchClient = () => {
  return useContext(context);
};
