---
id: testing
title: Testing Finch GraphQL
---

Using Finch GraphQL allows you to connect background and client scripts together in tests allowing you to write some integration tests that cover both background and client scripts.

### Port Connections

For port connections there is a bit of mock code you need use to get things hooked together. This code mocks the extension connection via ports.

```typescript
import { FinchApi } from '@finch-graphql/api';

type Listener = (port: Port) => void;

/**
 * This is the event lister interface the browser extension
 * api uses.
 */
class EventListener {
  listeners: Listener[] = [];
  addListener: (listener: Listener) => void;
  removeListener: (listener: Listener) => void;
  hasListener: (listener: Listener) => boolean;
  constructor() {
    this.addListener = listener => {
      this.listeners.push(listener);
    };
    this.removeListener = listener => {
      const index = this.listeners.indexOf(listener);
      this.listeners = [
        ...this.listeners.slice(0, index),
        ...this.listeners.slice(index + 1),
      ];
    };
    this.hasListener = listener => this.listeners.includes(listener);
  }
  broadcast(port: Port) {
    this.listeners.forEach(listener => listener(port));
  }
}

/**
 * This is a very simplistic port connection. It is used to
 * proxy messages to the hooks that are used in the background.
 */
class Port {
  name: string;
  messageMock = jest.fn();
  portListener: EventListener;
  onMessage: EventListener;
  onDisconnect: EventListener;
  constructor(name: string, portListener: EventListener) {
    this.name = name;
    this.portListener = portListener;
    this.messageMock = jest.fn();
    this.portListener.broadcast(this);
    this.onMessage = new EventListener();
    this.onDisconnect = new EventListener();
  }
  postMessage(msg) {
    this.messageMock(msg);
    this.onMessage.broadcast(this);
  }
  disconnect() {
    this.onDisconnect.broadcast(this);
  }
  getMock() {
    return this.messageMock;
  }
}

/**
 * This is the port connection mock. It is used to
 * proxy messages to the hooks that are used in the background.
 * This function is used to setup these connections and will
 * return a function that undoes the connection.
 *
 * We require passing of the created api here, this is only to make sure
 * the event bindings are setup correctly in the api.
 */
export const connectResolvers = (_api: FinchApi) => {
  const ogBrowser = window.browser;
  const portListener = new EventListener();
  const externalPortListener = new EventListener();

  Object.assign(global.browser, {
    runtime: {
      onConnect: portListener,
      onExternalConnect: externalPortListener,
      connect: jest.fn((id, connectionOptions) => {
        if (typeof id === 'object') {
          return new Port(id.name, portListener);
        }
        return new Port(connectionOptions.name, externalPortListener);
      }),
    },
  });

  return () => {
    window.browser = ogBrowser;
  };
};
```

### Manual Messaging Connections

If you are sending messages manually you can use the following code to connect your api.

```typescript
import { FinchApi } from '@finch-graphql/api';

const defaultSender = {
  id: 'foo',
  tab: {
    id: -1,
    url: 'http://localhost:3000/',
  },
  url: 'http://localhost:3000/',
};

export const connectResolvers = (
  api: FinchApi,
  context: any = defaultSender,
) => {
  const ogSendMessage = window.browser.runtime.sendMessage;
  browser.runtime.sendMessage = jest
    .fn()
    .mockImplementation(message => api.onMessage(message, context));
  return () => {
    browser.runtime.sendMessage = ogSendMessage;
  };
};
```
