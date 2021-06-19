import { FC, Dispatch, SetStateAction } from 'react'
import { FinchDevtools, FinchDevToolsMessageType } from 'finch-graphql'
import { usePort } from '../../hooks/usePort'
import { FinchDevtoolsMessage } from './types'

interface MessagePortConnectionProps {
  extensionId: string
  setMessages: Dispatch<SetStateAction<FinchDevtoolsMessage[]>>
}

export const MessagePortConnection: FC<MessagePortConnectionProps> = ({
  extensionId,
  setMessages,
}) => {
  usePort({
    extensionId,
    portName: FinchDevtools.portName,
    onMessage: (message: FinchDevtoolsMessage) => {
      switch (message.type) {
        case FinchDevToolsMessageType.Start:
          setMessages(messages => [...messages, message])
        case FinchDevToolsMessageType.Response:
          setMessages(messages => {
            const foundMessage = messages.find(
              existingMessage => existingMessage.id === message.id,
            )
            if (!foundMessage) {
              return messages
            }
            const index = messages.indexOf(foundMessage)
            return [
              ...messages.slice(0, index),
              { ...foundMessage, ...message },
              ...messages.slice(index + 1),
            ]
          })
      }
    },
  })
  return null
}
