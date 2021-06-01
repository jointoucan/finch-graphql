import React, { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { useEffect } from 'react'
import { queryApi } from 'finch-graphql'
import { EnableMessagesDoc, MessagePullQueryDoc } from './graphql'
import { safeParse } from './helpers'
import { MessageContent } from './MessageContent'
import { MessagesSidebar } from './MessageSidebar'

const TIMEOUT_SPEED = 1000

export const MessagesViewer = ({
  extensionId,
  messageKey,
  timeoutSpeed = TIMEOUT_SPEED,
}) => {
  const [messages, setMessages] = useState([])
  const [selectedQuery, selectQuery] = useState(null)

  const selectedQueryMessage = messages[selectedQuery]

  const appendMessages = newMessages => {
    const parsedMessages = newMessages.map(props => ({
      ...props,
      variables: safeParse(props.variables),
      response: safeParse(props.response),
      context: safeParse(props.context),
    }))
    setMessages(existingMessages => [...existingMessages, ...parsedMessages])
  }

  useEffect(() => {
    let timer = 0

    const runQuery = async () => {
      try {
        const resp = await queryApi(
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
      timer = setTimeout(runQuery, timeoutSpeed)
    }

    timer = setTimeout(runQuery, timeoutSpeed)
    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <Box display="flex" height="100%" backgroundColor="white">
      <MessagesSidebar
        messages={messages}
        selectedQuery={selectedQuery}
        selectQuery={selectQuery}
      />
      <Box backgroundColor="grey.100" pr={0.2} flex={0} zIndex={2} />
      <MessageContent message={selectedQueryMessage} />
    </Box>
  )
}
