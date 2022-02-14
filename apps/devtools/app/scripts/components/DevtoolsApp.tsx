import { FinchClient, FinchProvider } from '@finch-graphql/react';
import { FinchDefaultPortName, FinchMessageKey } from '@finch-graphql/types';
import { useMemo, useState } from 'react';
import { Tabs, TabPanels, TabPanel } from '@chakra-ui/react';
import GraphiQL, { Fetcher } from 'graphiql';
import { Header } from './Header';
import { StorageKey, DefaultQuery } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MessagesViewer } from './MessageViewer';
import { PortConnection } from './PortConnection';
import { useCallback } from 'react';
import { ConnectionInfo } from './types';
import { FinchConnectionType } from '@finch-graphql/api';

const client = new FinchClient();

export const DevtoolsApp = () => {
  const [extensionId, setExtensionId] = useLocalStorage(
    StorageKey.ExtensionId,
    '',
  );
  const [
    extensionProfile,
    setExtensionProfile,
  ] = useLocalStorage<ConnectionInfo>(
    `${StorageKey.ExtensionProfilePrefix}${extensionId}`,
    {
      messageKey: FinchMessageKey.Generic,
      nickName: null,
    },
  );
  const [tabIndex, setTabIndex] = useLocalStorage(StorageKey.TabIndex, 0);
  const [isConnected, setIsConnected] = useState(false);

  const messageKey = extensionProfile.messageKey;
  const connectionType = extensionProfile.connectionType;
  const messagePortName =
    extensionProfile.messagePortName ?? FinchDefaultPortName;

  // TODO need to destroy the client when new on is created
  const externalClient = useMemo(() => {
    return new FinchClient({
      messageKey,
      portName: messagePortName,
      id: extensionId,
      useMessages: FinchConnectionType.Message === connectionType,
    });
  }, [extensionId, messageKey, connectionType, messagePortName]);

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

  const graphQLFetcher = useCallback(
    ({
      messageKey: fetcherMessageKey,
      extensionId: fetcherExtensionId,
    }: {
      messageKey: string;
      extensionId: string;
    }): Fetcher => async ({ query, variables }) => {
      return externalClient.queryApi(query, variables || {}, {
        messageKey: fetcherMessageKey,
        id: fetcherExtensionId,
      });
    },
    [externalClient],
  );

  const fetcher = useMemo(() => {
    return graphQLFetcher({ messageKey, extensionId });
  }, [messageKey, extensionId]);

  return (
    <FinchProvider client={client}>
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
          onDisconnected={() => setIsConnected(false)}
          onConnected={() => setIsConnected(true)}
          setMessageKey={setMessageKey}
          setExtensionConnectionInfo={setExtensionProfile}
        />
        <Header
          isConnected={isConnected}
          extensionId={extensionId}
          setMessageKey={setMessageKey}
          setExtensionId={setExtensionId}
          messageKey={messageKey}
          connectionInfo={extensionProfile}
        />
        <TabPanels display="flex" flexDirection="column" height="100%">
          <TabPanel p="0" height="100%">
            <GraphiQL fetcher={graphQLFetcher} defaultQuery={DefaultQuery} />
          </TabPanel>
          <TabPanel p="0" height="100%">
            <MessagesViewer extensionId={extensionId} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </FinchProvider>
  );
};
