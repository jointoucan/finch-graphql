import React from 'react'
import { Image } from './Image'
import { Tabs, TabList, Tab, Box, Button } from '@chakra-ui/react'

export const Header = () => {
  return (
    <Box
      height="48px"
      display="flex"
      flexDirection="row"
      backgroundColor="white"
    >
      <TabList flex="1">
        <Box display="flex" alignItems="center" px={3}>
          <Image
            src="images/finch-graphql.svg"
            alt="Finch Logo"
            width="65.304px"
            height="40px"
          />
        </Box>
        <Tab>
          <span>
            Graph<em>i</em>QL
          </span>
        </Tab>
        <Tab>Settings</Tab>
        <Box
          flex="1"
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Button
            size="xs"
            mr={2}
            onClick={() => {
              window.location.reload()
            }}
            colorScheme="blue"
          >
            Refresh Frame
          </Button>
        </Box>
      </TabList>
    </Box>
  )
}
