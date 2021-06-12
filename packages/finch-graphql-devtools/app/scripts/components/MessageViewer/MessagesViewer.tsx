import React, { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { useEffect } from 'react'
import { queryApi } from 'finch-graphql'
import { EnableMessagesDoc, MessagePullQueryDoc } from './graphql'
import { safeParse } from './helpers'
import { MessageContent } from './MessageContent'
import { MessagesSidebar } from './MessageSidebar'
import { MessagesFilterBar } from './MessagesFilterBar'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { v4 } from 'uuid'
import { FinchDevtoolsQuery, FinchMessage } from './types'

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
  const [messages, setMessages] = useState([])
  const [selectedQuery, selectQuery] = useState(null)
  const [currentTabId] = useState(() => browser.devtools.inspectedWindow.tabId)

  const selectedQueryMessage = messages.find(({ id }) => selectedQuery === id)

  const appendMessages = (newMessages: FinchMessage[]) => {
    const parsedMessages = newMessages.map((props, i) => ({
      ...props,
      variables: safeParse(props.variables),
      response: safeParse(props.response),
      context: safeParse(props.context),
      id: v4(),
    }))
    setMessages(existingMessages => [...existingMessages, ...parsedMessages])
  }

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
    let timer = 0

    const runQuery = async () => {
      try {
        const resp = await queryApi<FinchDevtoolsQuery>(
          MessagePullQueryDoc,
          {},
          { id: extensionId, messageKey },
        )
        if (resp && !resp.data._finchDevtools.enabled) {
          await queryApi(EnableMessagesDoc, {}, { id: extensionId, messageKey })
        }
        if (
          resp &&
          resp.data._finchDevtools.messages &&
          resp.data._finchDevtools.messages.length
        ) {
          appendMessages(resp.data._finchDevtools.messages)
        }
      } catch (e) {
        console.error(e)
      }
      timer = window.setTimeout(runQuery, timeoutSpeed)
    }

    timer = window.setTimeout(runQuery, timeoutSpeed)
    return () => {
      clearInterval(timer)
    }
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
