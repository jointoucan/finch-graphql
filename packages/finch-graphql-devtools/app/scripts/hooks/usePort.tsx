import { useEffect } from 'react'
import { FinchDevtools } from 'finch-graphql'
import { FinchDevtoolsMessage } from '../components/MessageViewer/types'

interface PortOptions {
  extensionId: string
  portName?: string
  onMessage: (message: FinchDevtoolsMessage) => void
}

const DEFAULT_TIMEOUT = 1000

export const usePort = ({
  extensionId,
  portName = FinchDevtools.portName,
  onMessage,
}: PortOptions) => {
  const connectPort = (
    onMessage: (message: FinchDevtoolsMessage) => void,
    portChange: (port: browser.runtime.Port) => void,
  ) => {
    const port = browser.runtime.connect(extensionId, {
      name: portName,
    })

    port.onDisconnect.addListener(() =>
      setTimeout(() => {
        console.warn(`Reattempting reconnect to [${extensionId}]`)
        connectPort(onMessage, portChange)
      }, DEFAULT_TIMEOUT),
    )
    port.onMessage.addListener(onMessage)
    return port
  }

  useEffect(() => {
    if (!extensionId) {
      return () => {}
    }
    let port: browser.runtime.Port = connectPort(onMessage, newPort => {
      port = newPort
    })
    return () => port.disconnect()
  }, [extensionId])
}
