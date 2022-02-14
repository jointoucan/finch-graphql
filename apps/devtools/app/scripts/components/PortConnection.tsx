import { FC, Dispatch, SetStateAction, useEffect } from 'react';
import { FinchDevtools, FinchDevToolsMessageType } from '@finch-graphql/api';
import { useAtom } from 'jotai';
import { usePort } from '../hooks/usePort';
import { FinchDevtoolsIncomingMessage } from './MessageViewer/types';
import { ConnectionInfo } from './types';
import { createMessageAtom, updateMessageAtom } from '../atoms/messages';

interface PortConnectionProps {
  extensionId: string;
  setMessageKey: Dispatch<SetStateAction<string>>;
  onDisconnected: () => void;
  onConnected: () => void;
  setExtensionConnectionInfo: Dispatch<SetStateAction<ConnectionInfo>>;
}

/**
 * PortConnection is a component that holds the usePort hook.
 * This is a headless component and does not return any view.
 */
export const PortConnection: FC<PortConnectionProps> = ({
  extensionId,
  setMessageKey,
  onDisconnected,
  onConnected,
  setExtensionConnectionInfo,
}) => {
  const [, updateMessage] = useAtom(updateMessageAtom);
  const [, createMessage] = useAtom(createMessageAtom);
  const port = usePort({
    extensionId,
    portName: FinchDevtools.portName,
    dependencies: [],
    onMessage: (message: FinchDevtoolsIncomingMessage) => {
      switch (message.type) {
        case FinchDevToolsMessageType.Start:
          createMessage(message);
          break;
        case FinchDevToolsMessageType.Response:
          updateMessage(message);
          break;
        case FinchDevToolsMessageType.MessageKey:
          setMessageKey(message.messageKey);
          break;
        case FinchDevToolsMessageType.ConnectionInfo:
          setExtensionConnectionInfo(existingInfo => ({
            ...existingInfo,
            messageKey: message.messageKey,
            messagePortName: message.messagePortName,
            connectionType: message.connectionType,
          }));
          break;
      }
    },
  });

  useEffect(() => {
    if (port) {
      /**
       * request the current ports message key to auto configure the project.
       */
      port.postMessage({
        type: FinchDevToolsMessageType.RequestConnectionInfo,
      });
      onConnected();
    } else {
      onDisconnected();
    }
  }, [port]);

  return null;
};
