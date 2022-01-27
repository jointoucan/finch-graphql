import { TabList, Tab, Box } from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { Image } from './Image';
import { CircleIcon } from './Icons';
import { useColorScheme } from '../hooks/useColorScheme';
import { ExtensionSwitcher } from './ExtensionSwitcher';
import { ConnectionInfo } from './types';
import { isRecordingAtom } from '../atoms/devtool';

export const Header: React.FC<{
  isConnected: boolean;
  extensionId?: string;
  messageKey: string;
  connectionInfo?: ConnectionInfo;
  setMessageKey: (messageKey: string) => void;
  setExtensionId: (extensionId: string) => void;
}> = ({ isConnected, extensionId, setExtensionId, connectionInfo }) => {
  const [isRecording] = useAtom(isRecordingAtom);
  const scheme = useColorScheme();
  return (
    <Box
      height="48px"
      display="flex"
      flexDirection="row"
      backgroundColor={scheme.background}
      position="sticky"
      top="0"
      zIndex="10"
      borderColor={scheme.border}
    >
      <TabList flex="1" color={scheme.foreground}>
        <Box display="flex" alignItems="center" px={3}>
          <Image
            src="images/finch-graphql.svg"
            alt="Finch Logo"
            height="30px"
          />
        </Box>
        <Tab>
          <span>
            Graph<em>i</em>QL
          </span>
        </Tab>
        <Tab>
          Messages
          {isRecording ? (
            <CircleIcon ml={2} fontSize="xx-small" fill="red.500" />
          ) : null}
        </Tab>
        <Box flex="1" />
        <Box
          flex="0"
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
        >
          <ExtensionSwitcher
            isConnected={isConnected}
            extensionId={extensionId}
            setExtensionId={setExtensionId}
            connectionInfo={connectionInfo}
          />
          <Box pr={2} />
        </Box>
      </TabList>
    </Box>
  );
};
