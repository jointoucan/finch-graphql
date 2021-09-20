import React, { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { MessageContent } from './MessageContent'
import { MessagesSidebar } from './MessageSidebar'
import { MessagesFilterBar } from './MessagesFilterBar'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { FinchDevtoolsMessage } from './types'
import { useColorScheme } from '../../hooks/useColorScheme'

interface MessageViewerProps {
  extensionId: string
  isRecording: boolean
  setIsRecording: React.Dispatch<boolean>
  messages: FinchDevtoolsMessage[]
  setMessages: React.Dispatch<FinchDevtoolsMessage[]>
}

export const MessagesViewer: React.FC<MessageViewerProps> = ({
  isRecording,
  setIsRecording,
  messages,
  setMessages,
}) => {
  const scheme = useColorScheme()
  const [currentTabFilter, setCurrentTabFilter] = useLocalStorage(
    'messages:currentTabFilter',
    false,
  )
  const [filterString, setFilterString] = useLocalStorage(
    'messages:filterString',
    '',
  )
  const [selectedQuery, selectQuery] = useState(null)
  const [currentTabId] = useState(() => browser.devtools.inspectedWindow.tabId)

  const selectedQueryMessage = messages.find(({ id }) => selectedQuery === id)

  const filteredMessages = messages
    .filter(({ context }) => {
      if (
        currentTabFilter &&
        context.sender &&
        context.sender.tab &&
        context.sender.tab.id === currentTabId
      ) {
        return true
      } else if (!currentTabFilter) {
        return true
      }
      return false
    })
    .filter(({ operationName }) => {
      if (filterString) {
        if (operationName && operationName.includes(filterString)) {
          return true
        }
        return false
      }
      return true
    })

  return (
    <Box
      display="flex"
      height="100%"
      flexDirection="column"
      color={scheme.foreground}
      backgroundColor={scheme.background}
    >
      <MessagesFilterBar
        onClearMessage={() => {
          setMessages([])
        }}
        currentTabOnly={currentTabFilter}
        onToggleCurrentTabFilter={() => {
          setCurrentTabFilter(!currentTabFilter)
        }}
        filterString={filterString}
        onFilterStringChange={e => {
          setFilterString(e.currentTarget.value)
        }}
        isRecording={isRecording}
        onToggleRecording={() => setIsRecording(!isRecording)}
      />
      <Box display="flex" flex="1" backgroundColor={scheme.background}>
        <MessagesSidebar
          messages={filteredMessages}
          selectedQuery={selectedQuery}
          selectQuery={selectQuery}
        />
        <Box
          backgroundColor={scheme.backgroundSecondary}
          pr={0.2}
          flex={0}
          zIndex={2}
        />
        <MessageContent
          message={selectedQueryMessage}
          isRecording={isRecording}
        />
      </Box>
    </Box>
  )
}
