import { Image } from './Image'
import {
  TabList,
  Tab,
  Box,
  IconButton,
  Tooltip,
  Heading,
  Text,
} from '@chakra-ui/react'
import { CircleIcon, RefreshIcon } from './Icons'
import { useColorScheme } from '../hooks/useColorScheme'
import { ExtensionSwitcher } from './ExtensionSwitcher'

export const Header: React.FC<{
  isRecording: boolean
  isConnected: boolean
  extensionId?: string
}> = ({ isRecording, isConnected, extensionId }) => {
  const scheme = useColorScheme()
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
        <Tab>Settings</Tab>
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
          />
          <Box
            width="1px"
            height="25px"
            backgroundColor={scheme.border}
            mx={2}
          />
          <Tooltip label="Refresh frame" openDelay={500}>
            <IconButton
              size="xs"
              aria-label="Refresh frame"
              mr={2}
              fill={scheme.foreground}
              icon={<RefreshIcon />}
              onClick={() => {
                window.location.reload()
              }}
              variant="outline"
              borderColor={scheme.border}
            />
          </Tooltip>
        </Box>
      </TabList>
    </Box>
  )
}
