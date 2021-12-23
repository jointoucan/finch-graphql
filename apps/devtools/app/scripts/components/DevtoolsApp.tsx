import { queryApi } from '@finch-graphql/react';
import { FinchMessageKey } from '@finch-graphql/types';
import { useMemo, useState } from 'react';
import { Tabs, TabPanels, TabPanel } from '@chakra-ui/react';
import GraphiQL, { Fetcher } from 'graphiql';
import { Header } from './Header';
import { StorageKey, DefaultQuery } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MessagesViewer } from './MessageViewer';
import { FinchDevtoolsMessage } from './MessageViewer/types';
import { PortConnection } from './PortConnection';
import { useCallback } from 'react';

export const graphQLFetcher = ({
  messageKey,
  extensionId,
}: {
  messageKey: string;
  extensionId: string;
}): Fetcher => async ({ query, variables }) => {
  return queryApi(query, variables || {}, {
    messageKey,
    id: extensionId,
  });
};

export const DevtoolsApp = () => {
  const [extensionId, setExtensionId] = useLocalStorage(
    StorageKey.ExtensionId,
    '',
  );
  const [extensionProfile, setExtensionProfile] = useLocalStorage<{
    messageKey: string;
    nickName: null | string;
  }>(`${StorageKey.ExtensionProfilePrefix}${extensionId}`, {
    messageKey: FinchMessageKey.Generic,
    nickName: null,
  });
  const [tabIndex, setTabIndex] = useLocalStorage(StorageKey.TabIndex, 0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [messages, setMessages] = useState<FinchDevtoolsMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const messageKey = extensionProfile.messageKey;

  const setMessageKey = useCallback(
    (updatedMessageKey: string) => {
      const newExtensionProfile = {
        ...extensionProfile,
        messageKey: updatedMessageKey,
      };
      setExtensionProfile(newExtensionProfile);
    },
    [extensionId, extensionProfile],
  );

  const fetcher = useMemo(() => {
    return graphQLFetcher({ messageKey, extensionId });
  }, [messageKey, extensionId]);

  return (
    <Tabs
      colorScheme="blue"
      onChange={index => setTabIndex(index)}
      defaultIndex={tabIndex}
      display="flex"
      flexDirection="column"
      height="100%"
      isLazy
    >
      <PortConnection
        extensionId={extensionId}
        setMessages={setMessages}
        isRecording={isRecording}
        onDisconnected={() => setIsConnected(false)}
        onConnected={() => setIsConnected(true)}
        setMessageKey={setMessageKey}
      />
      <Header
        isConnected={isConnected}
        isRecording={isRecording}
        extensionId={extensionId}
        setMessageKey={setMessageKey}
        setExtensionId={setExtensionId}
        messageKey={messageKey}
      />
      <TabPanels display="flex" flexDirection="column" height="100%">
        <TabPanel p="0" height="100%">
          <GraphiQL fetcher={fetcher} defaultQuery={DefaultQuery} />
        </TabPanel>
        <TabPanel p="0" height="100%">
          <MessagesViewer
            extensionId={extensionId}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            messages={messages}
            setMessages={setMessages}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
