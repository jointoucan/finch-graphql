import { Image } from './Image'
import {
  TabList,
  Tab,
  Box,
  IconButton,
  Tooltip,
  Heading,
} from '@chakra-ui/react'
import { CircleIcon, RefreshIcon } from './Icons'
import { useColorScheme } from '../hooks/useColorScheme'

export const Header: React.FC<{
  isRecording: boolean
  isConnected: boolean
}> = ({ isRecording, isConnected }) => {
  const scheme = useColorScheme()
  return (
    <Box
      height="48px"
      display="flex"
      flexDirection="row"
      backgroundColor={scheme.background}
      position="sticky"
      top="0"
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
          <CircleIcon
            ml={2}
            fontSize="xx-small"
            fill={isConnected ? 'green.300' : scheme.border}
            mr={2}
          />
          <Heading size="xxs" whiteSpace="nowrap">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Heading>
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
