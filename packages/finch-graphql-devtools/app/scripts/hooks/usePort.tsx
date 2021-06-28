import { useEffect, useState } from 'react'
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
}: PortOptions): chrome.runtime.Port | browser.runtime.Port | null => {
  const [currentPort, setCurrentPort] = useState<
    chrome.runtime.Port | browser.runtime.Port | null
  >(null)
  const connectPort = (
    onMessage: (message: FinchDevtoolsMessage) => void,
    timeoutChanged: (timeout: number) => void,
  ) => {
    const port = browser.runtime.connect(extensionId, {
      name: portName,
    })
    let timestamp = 0
    setCurrentPort(port)

    port.onDisconnect.addListener(() => {
      timestamp = window.setTimeout(() => {
        console.warn(`Reattempting reconnect to [${extensionId}]`)
        connectPort(onMessage, timeoutChanged)
      }, DEFAULT_TIMEOUT)
      timeoutChanged(timestamp)
      setCurrentPort(null)
    })
    port.onMessage.addListener(onMessage)
  }

  useEffect(() => {
    if (!extensionId) {
      return () => {}
    }
    let timer = 0
    connectPort(onMessage, currentTimer => {
      timer = currentTimer
    })
    return () => clearTimeout(timer)
  }, [extensionId])

  return currentPort
}
