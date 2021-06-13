import React, { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { useEffect } from 'react'
import { FinchDevtools } from 'finch-graphql'
import { MessageContent } from './MessageContent'
import { MessagesSidebar } from './MessageSidebar'
import { MessagesFilterBar } from './MessagesFilterBar'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { FinchMessage } from 'finch-graphql/dist/background/types'
// import { FinchMessage } from './types'

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
  const [messages, setMessages] = useState<FinchMessage[]>([])
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

  useEffect(() => {
    const port = browser.runtime.connect(extensionId, {
      name: FinchDevtools.portName,
    })

    port.onMessage.addListener((message: FinchMessage) => {
      setMessages(messages => [...messages, message])
    })
    return () => port.disconnect()
  }, [])

  return (
    <Box
      display="flex"
      height="100%"
      flexDirection="column"
      backgroundColor="white"
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
      />
      <Box display="flex" flex="1" backgroundColor="white">
        <MessagesSidebar
          messages={filteredMessages}
          selectedQuery={selectedQuery}
          selectQuery={selectQuery}
        />
        <Box backgroundColor="grey.100" pr={0.2} flex={0} zIndex={2} />
        <MessageContent message={selectedQueryMessage} />
      </Box>
    </Box>
  )
}
