import { createElement, createContext, FC, useContext } from "react";

interface ExtensionProviderProps {
  id?: string;
  port?: browser.runtime.Port;
}

const context = createContext<ExtensionProviderProps>({
  id: undefined,
  port: undefined,
});
const { Provider } = context;

export const ExtensionProvider: FC<ExtensionProviderProps> = ({
  id,
  children,
  port,
}) => {
  return createElement(Provider, { value: { id, port }, children });
};

export const useExtension = () => {
  return useContext(context);
};
