import { Image } from './Image'
import { TabList, Tab, Box, IconButton } from '@chakra-ui/react'
import { RefreshIcon } from './RefreshIcon'

export const Header = () => {
  return (
    <Box
      height="48px"
      display="flex"
      flexDirection="row"
      backgroundColor="white"
      position="sticky"
      top="0"
    >
      <TabList flex="1">
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
            fill="gray.600"
            icon={<RefreshIcon />}
            onClick={() => {
              window.location.reload()
            }}
            variant="outline"
            borderColor="grey.200"
          />
        </Box>
      </TabList>
    </Box>
  )
}
