import { createElement, createContext, FC, useContext } from "react";

interface ExtensionProviderProps {
  id?: string;
}

const context = createContext({ id: undefined });
const { Provider } = context;

export const ExtensionProvider: FC<ExtensionProviderProps> = ({
  id,
  children,
}) => {
  return createElement(Provider, { value: { id }, children });
};

export const useExtension = () => {
  return useContext(context);
};
