---
id: testing
title: Testing Finch GraphQL
---

Using Finch GraphQL allows you to connect background and client scripts together in tests allowing you to write some integration tests that cover both background and client scripts. It is currently recommended that you use async messaging in your tests. This makes it super simple to write integration tests for Finch GraphQL. You can do something like this to swap the connection for tests.

```typescript
import { FinchApi, FinchPortConnection, FinchMessageConnection } from '@finch/api';

new FinchApi({
  ...
  connection: process.env.NODE_ENV === 'test'
    ? new FinchMessageConnection()
    : new FinchPortConnection(),
});
```

### Mocking Messaging Connections

If you are sending messages via async messages you can use the following code to connect your api with content scripts.

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
