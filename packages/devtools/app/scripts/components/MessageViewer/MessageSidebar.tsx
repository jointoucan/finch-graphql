import React from 'react'
import { Box, Text, Heading, Tag, Divider } from '@chakra-ui/react'
import { AutoSizer, List, ListRowRenderer } from 'react-virtualized'
import { FinchDevtoolsMessage } from './types'
import { getMessageTagInfo } from './helpers'
import { useColorScheme } from '../../hooks/useColorScheme'
import { ColorScheme } from '../../styles/colorScheme'

interface MessageSidebarProp {
  messages: FinchDevtoolsMessage[]
  selectQuery: (id: string) => void
  selectedQuery: string
  scheme: ColorScheme
}

export const renderListItem = ({
  messages,
  selectQuery,
  selectedQuery,
  scheme,
}: MessageSidebarProp): ListRowRenderer => ({ index, key, style }) => {
  const message = messages[index]

  if (!message) {
    return null
  }

  const { response, operationName, timeTaken, id } = message
  const tag = getMessageTagInfo(message)

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
        backgroundColor={
          selectedQuery === id ? scheme.highlight : scheme.background
        }
      >
        <Box display="flex" flexDirection="row" alignItems="center" px={4}>
          <Tag backgroundColor={tag.color} mr={2} color="gray.600">
            {tag.label}
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
      <Divider backgroundColor={scheme.border} />
    </Box>
  )
}

export const MessagesSidebar: React.FC<Omit<MessageSidebarProp, 'scheme'>> = ({
  messages,
  selectQuery,
  selectedQuery,
}) => {
  const scheme = useColorScheme()
  const renderer = renderListItem({
    messages,
    selectQuery,
    selectedQuery,
    scheme,
  })

  return (
    <Box flex={1} maxWidth="30vw" overflow="scroll">
      <Box
        zIndex={2}
        position="sticky"
        top="0"
        backgroundColor={scheme.background}
      >
        <Box
          px={4}
          py={2}
          cursor="pointer"
          display="flex"
          flexDirection="column"
        >
          <Heading size="sm">Messages</Heading>
        </Box>
        <Divider backgroundColor={scheme.border} />
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
