import { DocumentNode, GraphQLFormattedError } from 'graphql';
import { onConnectExternal, removeConnectExternalListener } from '../browser';
import { FinchContextObj } from '../types';
import {
  FinchStartMessage,
  FinchResponseMessage,
  FinchDevToolsMessageType,
} from './types';

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

  onStart({
    id,
    query,
    operationName,
    variables,
    context,
  }: {
    id: string;
    query: DocumentNode;
    operationName: string;
    variables: unknown;
    context: FinchContextObj;
  }) {
    this.broadcast<FinchStartMessage>({
      type: FinchDevToolsMessageType.Start,
      id,
      query,
      operationName: operationName ?? 'unknown',
      initializedAt: Date.now(),
      variables,
      context,
    });
    return id;
  }

  onResponse = async ({
    id,
    timeTaken,
    response,
  }: {
    id: string;
    timeTaken: number;
    response: { data?: unknown; errors?: GraphQLFormattedError[] };
  }) => {
    this.broadcast<FinchResponseMessage>({
      type: FinchDevToolsMessageType.Response,
      id,
      timeTaken,
      response,
    });
  };
}
