import { Image } from './Image'
import { TabList, Tab, Box, IconButton } from '@chakra-ui/react'
import { RefreshIcon } from './RefreshIcon'
import { useColorScheme } from '../hooks/useColorScheme'

export const Header = () => {
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
        <Tab>Messages</Tab>
        <Tab>Settings</Tab>
        <Box
          flex="1"
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
        >
          <IconButton
            size="xs"
            aria-label="refresh"
            mr={2}
            fill={scheme.foreground}
            icon={<RefreshIcon />}
            onClick={() => {
              window.location.reload()
            }}
            variant="outline"
            borderColor={scheme.border}
          />
        </Box>
      </TabList>
    </Box>
  )
}
