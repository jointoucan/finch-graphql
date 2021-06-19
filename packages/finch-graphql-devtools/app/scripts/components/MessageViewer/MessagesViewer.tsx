import React, { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { MessageContent } from './MessageContent'
import { MessagesSidebar } from './MessageSidebar'
import { MessagesFilterBar } from './MessagesFilterBar'
import { MessagePortConnection } from './MessagePortConnection'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { FinchDevtoolsMessage } from './types'

const TIMEOUT_SPEED = 1000

interface MessageViewerProps {
  extensionId: string
  messageKey: string
  timeoutSpeed?: number
}

export const MessagesViewer: React.FC<MessageViewerProps> = ({
  extensionId,
  messageKey,
  timeoutSpeed = TIMEOUT_SPEED,
}) => {
  const [currentTabFilter, setCurrentTabFilter] = useLocalStorage(
    'messages:currentTabFilter',
    false,
  )
  const [filterString, setFilterString] = useLocalStorage(
    'messages:filterString',
    '',
  )
  const [messages, setMessages] = useState<FinchDevtoolsMessage[]>([])
  const [selectedQuery, selectQuery] = useState(null)
  const [currentTabId] = useState(() => browser.devtools.inspectedWindow.tabId)
  const [isRecording, setIsRecording] = useState<boolean>(false)

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
      backgroundColor="white"
    >
      {isRecording && (
        <MessagePortConnection
          extensionId={extensionId}
          setMessages={setMessages}
        />
      )}

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
      <Box display="flex" flex="1" backgroundColor="white">
        <MessagesSidebar
          messages={filteredMessages}
          selectedQuery={selectedQuery}
          selectQuery={selectQuery}
        />
        <Box backgroundColor="grey.100" pr={0.2} flex={0} zIndex={2} />
        <MessageContent
          message={selectedQueryMessage}
          isRecording={isRecording}
        />
      </Box>
    </Box>
  )
}
