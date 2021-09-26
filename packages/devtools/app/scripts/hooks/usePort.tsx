import { useEffect, useState } from 'react';
import { FinchDevtools } from '@finch-graphql/api';
import { FinchDevtoolsIncomingMessage } from '../components/MessageViewer/types';

interface PortOptions {
  extensionId: string;
  portName?: string;
  onMessage: (message: FinchDevtoolsIncomingMessage) => void;
  dependencies?: any[];
}

type MaybePort = chrome.runtime.Port | browser.runtime.Port | null;

const DEFAULT_TIMEOUT = 1000;

/**
 * usePort is a hook that connects to an external extensions port, and if it fails
 * it will attempt to reconnect.
 * @param options.extensionId the id to connect a port to.
 * @param options.portName the name on the port to connect, defaults to the Finch devtools port name.
 * @param options.dependencies an array of dependencies that can be passed to up the onMessage function.
 * @param options.onMessage a handler to call whenever there is a message.
 * @returns maybe a port if the connect is live.
 */
export const usePort = ({
  extensionId,
  portName = FinchDevtools.portName,
  dependencies = [],
  onMessage,
}: PortOptions): MaybePort => {
  const [currentPort, setCurrentPort] = useState<MaybePort>(null);

  useEffect(() => {
    if (!extensionId) {
      return () => {};
    }
    /**
     * isMounted is a variable that helps us indicate if the current effect is mounted
     */
    let isMounted = true;
    /**
     * timer is a variable that hold the current timeout, so we can clean it up on un-mount
     */
    let timer = 0;
    /**
     * thisPort is a scoped port that we use to disconnect any old connection on un-mount of the effect.
     */
    let thisPort: MaybePort = null;
    /**
     * connectPort is a function that will recursively call itself to attempt the reconnect of a
     * port.
     * @param onMessage a function that will be called each time there is a message from the port
     * @param timeoutChanged a function that will receive the latest timeout to reconnect, this is used to be able to cleanup the timeout on unmount.
     */
    const connectPort = (
      onPortMessage: (message: FinchDevtoolsIncomingMessage) => void,
      timeoutChanged: (timeout: number) => void,
    ) => {
      try {
        const port = browser.runtime.connect(extensionId, {
          name: portName,
        });
        let timestamp = 0;
        thisPort = port;

        /**
         * We set the current port after a small timeout to avoid flicking of UI when
         * reconnecting.
         */
        const connectedTimeout = window.setTimeout(() => {
          if (!isMounted) {
            return;
          }
          setCurrentPort(port);
        }, 300);

        /**
         * This listens for the background to disconnect from the port. If the extension does not establish a
         * connection this gets called quickly after creating the port.
         */
        port.onDisconnect.addListener(() => {
          if (!isMounted) {
            return;
          }
          clearTimeout(connectedTimeout);
          timestamp = window.setTimeout(() => {
            console.warn(`Reattempting reconnect to [${extensionId}]`);
            connectPort(onPortMessage, timeoutChanged);
          }, DEFAULT_TIMEOUT);
          timeoutChanged(timestamp);
          setCurrentPort(null);
        });
        /**
         * This is the onMessage event binding.
         */
        port.onMessage.addListener(onPortMessage);
      } catch (e) {
        // This will throw on a bad extension id
      }
    };
    connectPort(onMessage, currentTimer => {
      timer = currentTimer;
    });
    /**
     * cleanup of the effect, and if we have a scoped port we tear that down too.
     */
    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (thisPort) {
        thisPort.disconnect();
      }
    };
  }, [extensionId, ...dependencies]);

  return currentPort;
};
