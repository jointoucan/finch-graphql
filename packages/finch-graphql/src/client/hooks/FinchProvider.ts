import { createElement, createContext, FC, useContext } from 'react';
import { FinchClient } from '../FinchClient';

interface FinchProviderProps {
  client: FinchClient;
}

const context = createContext<FinchProviderProps>({
  client: new FinchClient({}),
});
const { Provider } = context;

export const FinchProvider: FC<FinchProviderProps> = ({ client, children }) => {
  return createElement(Provider, { value: { client }, children });
};

export const useFinchClient = () => {
  return useContext(context);
};
