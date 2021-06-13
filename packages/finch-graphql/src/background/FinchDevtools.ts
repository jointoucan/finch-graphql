import { v4 } from 'uuid';
import { onConnectExternal, removeConnectExternalListener } from '../browser';
import { FinchMessage, MessageMeta } from './types';

export class FinchDevtools {
  static portName = '_finchDevtools';
  private connections: (browser.runtime.Port | chrome.runtime.Port)[] = [];
  private unbind: () => void = () => {};

  constructor(options: { autoListen: boolean } = { autoListen: true }) {
    if (options.autoListen) {
      this.listenForConnections();
    }
  }

  public listenForConnections() {
    // Remove existing listeners if called twice
    this.unbind();

    const onAddConnection = port => {
      if (port.name !== FinchDevtools.portName) {
        return;
      }
      this.connections.push(port);
      port.onDisconnect.addListener(() => {
        const portIndex = this.connections.indexOf(port);
        if (portIndex === -1) {
          return;
        }
        this.connections.splice(portIndex, 1);
      });
    };
    onConnectExternal(onAddConnection);
    this.unbind = () => {
      removeConnectExternalListener(onAddConnection);
    };
  }

  public stopListeningForConnections() {
    this.unbind();
  }

  broadcast<T extends {}>(message: T) {
    this.connections.forEach(port => {
      port.postMessage(message);
    });
  }

  onResponse = async ({
    query,
    operationName,
    timeTaken,
    response,
    variables,
    context,
  }: MessageMeta) => {
    if (operationName !== 'getMessages' && operationName !== 'enableMessages') {
      this.broadcast<FinchMessage>({
        id: v4(),
        query,
        operationName: operationName ?? 'unknown',
        timeTaken,
        initializedAt: Date.now() - timeTaken,
        response,
        variables,
        context,
      });
    }
  };
}
