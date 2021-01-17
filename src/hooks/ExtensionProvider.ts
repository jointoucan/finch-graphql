import { createElement, createContext, FC, useContext } from "react";

interface ExtensionProviderProps {
  id?: string;
  port?: browser.runtime.Port;
  messageKey?: string;
}

const context = createContext<ExtensionProviderProps>({
  id: undefined,
  port: undefined,
  messageKey: undefined,
});
const { Provider } = context;

export const ExtensionProvider: FC<ExtensionProviderProps> = ({
  id,
  children,
  port,
  messageKey,
}) => {
  return createElement(Provider, { value: { id, port, messageKey }, children });
};

export const useExtension = () => {
  return useContext(context);
};
