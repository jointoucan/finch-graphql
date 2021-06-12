import React from 'react'
import { Box, Text, Heading, Tag, Divider } from '@chakra-ui/react'
import { AutoSizer, List, ListRowRenderer } from 'react-virtualized'
import { FinchMessageParsed } from './types'

interface MessageSidebarProp {
  messages: FinchMessageParsed[]
  selectQuery: (id: string) => void
  selectedQuery: string
}

export const renderListItem = ({
  messages,
  selectQuery,
  selectedQuery,
}: MessageSidebarProp): ListRowRenderer => ({ index, key, style }) => {
  const message = messages[index]

  if (!message) {
    return null
  }

  const { response, operationName, timeTaken, id } = message

  const hasErrors = response && response.errors && response.errors.length
  return (
    <Box style={style} key={key}>
      <Box
        py={2}
        onClick={() => {
          selectQuery(id)
        }}
        cursor="pointer"
        display="flex"
        flexDirection="column"
        backgroundColor={selectedQuery === id ? 'teal.100' : 'white'}
      >
        <Box display="flex" flexDirection="row" alignItems="center" px={4}>
          <Tag backgroundColor={hasErrors ? 'red.200' : 'teal.200'} mr={2}>
            {hasErrors ? 'ERROR' : 'OK'}
          </Tag>
          <Text
            size="sm"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            flex={1}
          >
            {operationName}
          </Text>
          <Text
            size="sm"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {timeTaken}ms
          </Text>
        </Box>
      </Box>
      <Divider />
    </Box>
  )
}

export const MessagesSidebar: React.FC<MessageSidebarProp> = ({
  messages,
  selectQuery,
  selectedQuery,
}) => {
  const renderer = renderListItem({ messages, selectQuery, selectedQuery })

  return (
    <Box flex={1} maxWidth="30vw" overflow="scroll">
      <Box zIndex={2} position="sticky" top="0" backgroundColor="white">
        <Box
          px={4}
          py={2}
          cursor="pointer"
          display="flex"
          flexDirection="column"
        >
          <Heading size="sm">Messages</Heading>
        </Box>
        <Divider />
      </Box>
      <AutoSizer>
        {({ width, height }) => (
          <List
            ref="message-list"
            width={width}
            height={height}
            rowCount={messages.length}
            rowRenderer={renderer}
            rowHeight={41}
          />
        )}
      </AutoSizer>
    </Box>
  )
}
