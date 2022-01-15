---
id: api-ref
title: Api
---

## Overview

FinchApi is the API potion of the Finch library. This is what defines the schema and executes the resolvers of GraphQL API requests. This should live in the background of your extension to be able to serve request to your extension, or websites client scripts. FinchApi is a class and most configuration will be done through the constructor, but after and instance is created there are also some useful methods you can use to execute queries and mutations.

## Reference

### FinchApi

This is the main class of the api package. It is used to create an instance of the api.

```typescript
import { FinchApi } from '@finch-graphql/api';

export const api = FinchApi(options);
```

#### Parameters

The `options` is the only param to the constructor of the FinchApi class.

`options.typeDefs` is a GraphQL DocumentNode or array of GraphQL DocumentNodes. This defines the schema of the API.

`options.resolvers` is an object with the resolvers of the API or an array of objects with the resolvers of the API. The shape of this is defined by your GraphQL schema and you can read more about this [here](https://www.graphql-tools.com/docs/resolvers).

`options.context` is an object with the context of the API. This is the context of the GraphQL query and you can use it to pass data to the resolvers.

`options.connection` is a instance of a connection class. This can be used to create a way to list for messages. By default this will create a port connection via the `FinchPortConnection` class. To use traditional message passing you can use the `FinchMessageConnection` class. To turn off all auto connection mechanisms you can use the `FinchNullConnection` class.

`options.messageKey` this is a string that controls the key of the message, this is used to identify the message in the messaging system is coming from the right location.

`options.messagePortName` this is a string that controls the name of the message port. This is used to identify the message port in the messaging system.

`options.disableIntrospection` is a boolean that disables the introspection of the API. This is useful if you allow you production application connect to the public devtool.

`options.disableDevtools` is a boolean that disables the devtools of the API. This does not stop introspection of the API, but stop the ability of the devtools to connect to the API for debugging messages in the API.

`options.middleware` is an array of functions that will be executed before the GraphQL request is executed. See more about [middleware here](https://www.graphql-modules.com/docs/advanced/middlewares/).

### FinchApi::query

This is a method that allows you to execute a GraphQL query in the background of the extension. This is useful so you can expose functionality in the graph to your background script.

```typescript
const resp = await api.query(query [, variables]);
```

This can be used to execute queries and mutations.

### FinchApi::onMessage

This is a method that you can call manually to handle messages from the extension.

```typescript
// Not needed if you have attachMessages set to true
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  return api.onMessage(message, sender);
});
```

### FinchApi::onExternalMessage

This is a method that you can call manually to handle messages from the extension.

```typescript
// Not needed if you have attachMessages set to true
browser.runtime.onExternalMessage.addListener(
  (message, sender, sendResponse) => {
    return api.onExternalMessage(message, sender);
  },
);
```

### FinchPortConnection

Ports connections are automatically created but in case you want to control all the options passed to FinchPortConnection you can use this class and pass it to the connection option of `FinchApi`.

```typescript
import { FinchPortConnection, FinchApi } from '@finch-graphql/api';

const api = new FinchApi({
  ...
  connection: new FinchPortConnection({
    messagePortName: 'ITS_A_SECRET',
    external: false,
  }),
});
```

There is only a few options available for the port connection.

`options.messagePortName` is a string that is the name of the message port. Default is `_finchMessagePort`.

`options.external` is a boolean that controls if we should listen to the external message port or not.

### FinchMessageConnection

FinchMessageConnection is a connection class that is used to create a connection to the extension using async message. This is how 2.x versions of Finch worked. If you do not need any long lasting connections you may want to pass this FinchMessageConnection class to the connection option of `FinchApi`.

```typescript
import { FinchMessageConnection, FinchApi } from '@finch-graphql/api';

const api = new FinchApi({
  ...
  connection: new FinchMessageConnection({
    messageKey: 'ITS_A_SECRET',
    external: false,
  }),
});
```

`options.messageKey` is a string that is the key of the message. Default is `Finch-message`.

`options.external` is a boolean that controls if we should listen to the external message port or not.

### FinchNullConnection

This is a connection class that is used to disable all connection mechanisms. This is useful if you need to handle messages from the extension manually. Auto connection for messages my cause issues in other message listeners.

```typescript
import { FinchNullConnection, FinchApi } from '@finch-graphql/api';

const api = new FinchApi({
  ...
  connection: new FinchNullConnection(),
});
```
