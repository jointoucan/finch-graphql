import React from 'react'
import { Image } from './Image'
import { Tabs, TabList, TabPanels, Tab, TabPanel, Box } from '@chakra-ui/react'

export const Header = () => {
  return (
    <Box height="48px" display="flex" flexDirection="row">
      <Image
        className="finch-logo"
        src="images/finch-graphql.svg"
        alt="Finch Logo"
        width="65.304px"
        height="40px"
      />
      <TabList>
        <Tab>
          <span>
            Graph<em>i</em>QL
          </span>
        </Tab>
        <Tab>Settings</Tab>
      </TabList>
    </Box>
  )
}
