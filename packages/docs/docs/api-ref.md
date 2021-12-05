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

`options.attachMessages` is a boolean that defines if the api should attach the extensions messaging system automatically. This should be false if you need hook this up manually.

`options.attachExternalMessages` is a boolean that defines if the api should attach the extensions external messaging system automatically. This should be false if you need hook this up manually.

`options.messageKey` this is a string that controls the key of the message, this is used to identify the message in the messaging system is coming from the right location.

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
