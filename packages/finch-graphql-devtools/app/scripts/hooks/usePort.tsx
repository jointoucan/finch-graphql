import { useEffect, useState } from 'react'
import { FinchDevtools } from 'finch-graphql'
import { FinchDevtoolsMessage } from '../components/MessageViewer/types'

interface PortOptions {
  extensionId: string
  portName?: string
  onMessage: (message: FinchDevtoolsMessage) => void
  dependencies?: any[]
}

const DEFAULT_TIMEOUT = 1000

type MaybePort = chrome.runtime.Port | browser.runtime.Port | null

export const usePort = ({
  extensionId,
  portName = FinchDevtools.portName,
  dependencies = [],
  onMessage,
}: PortOptions): MaybePort => {
  const [currentPort, setCurrentPort] = useState<MaybePort>(null)

  useEffect(() => {
    if (!extensionId) {
      return () => {}
    }
    let isMounted = true
    let timer = 0
    let thisPort: MaybePort = null
    const connectPort = (
      onMessage: (message: FinchDevtoolsMessage) => void,
      timeoutChanged: (timeout: number) => void,
    ) => {
      const port = browser.runtime.connect(extensionId, {
        name: portName,
      })
      let timestamp = 0
      setCurrentPort(port)
      thisPort = port

      port.onDisconnect.addListener(() => {
        if (!isMounted) {
          return
        }
        timestamp = window.setTimeout(() => {
          console.warn(`Reattempting reconnect to [${extensionId}]`)
          connectPort(onMessage, timeoutChanged)
        }, DEFAULT_TIMEOUT)
        timeoutChanged(timestamp)
        setCurrentPort(null)
      })
      port.onMessage.addListener(onMessage)
    }
    connectPort(onMessage, currentTimer => {
      timer = currentTimer
    })
    return () => {
      isMounted = false
      clearTimeout(timer)
      if (thisPort) {
        thisPort.disconnect()
      }
    }
  }, [extensionId, ...dependencies])

  return currentPort
}
