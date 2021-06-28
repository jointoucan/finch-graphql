import { FC, Dispatch, SetStateAction } from 'react'
import { FinchDevtools, FinchDevToolsMessageType } from 'finch-graphql'
import { usePort } from '../hooks/usePort'
import { FinchDevtoolsMessage } from './MessageViewer/types'
import { useEffect } from 'react'

interface PortConnectionProps {
  extensionId: string
  setMessages: Dispatch<SetStateAction<FinchDevtoolsMessage[]>>
  isRecording: boolean
  onDisconnected: () => void
  onConnected: () => void
}

export const PortConnection: FC<PortConnectionProps> = ({
  extensionId,
  setMessages,
  isRecording,
  onDisconnected,
  onConnected,
}) => {
  const port = usePort({
    extensionId,
    portName: FinchDevtools.portName,
    onMessage: (message: FinchDevtoolsMessage) => {
      switch (message.type) {
        case FinchDevToolsMessageType.Start:
          if (isRecording) {
            setMessages(messages => [...messages, message])
          }
          break
        case FinchDevToolsMessageType.Response:
          if (isRecording) {
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
          break
      }
    },
  })

  useEffect(() => {
    if (port) {
      onConnected()
    } else {
      onDisconnected()
    }
  }, [port])

  return null
}
