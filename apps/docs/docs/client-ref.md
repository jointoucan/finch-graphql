---
id: client-ref
title: Client
---

## Overview

FinchClient is the client class of the Finch framework. It is used to send requests to the API and receive responses. It is also used to create and manage cache of the responses.

## Reference

### FinchClient

This is the main export of the client package. This is a class that is mostly configured by the constructor options, but this client can also be used as an imperative API for Finch.

```typescript
import { FinchClient } from '@finch-graphql/client';

const client = new FinchClient(options);
```

This client is also re-exported by the react package.

#### Parameters

The `options` parameter is an object that can be used to configure the client, this is the only parameter for the FinchClient constructor.

`options?.id` is the id of the extension you are trying to communicate with. This is only needed if you are messaging the extension externally.

`options?.messageKey` is the key used to send messages to the extension. There is a default key that is used if this is not provided. This should be the same key passed to FinchApi.

`options.cache` is an instance of FinchCache. This is used to store cached responses, and be able to sync all identical requests to the same response.

`options?.useMessages` is a boolean that controls if the client should use messages to communicate with the extension. The default behavior is to use ports for messaging.

`options?.autoStart` is a boolean that controls if the client should connect the port right away. By default this is true, but you can turn it off and call `client.start()` to start the connection.

### FinchClient::query

`query` queries the Api and returns a properly typed response. This also has the side effect of setting cache and updating any queries that subscribe to the cache.

```typescript
const response = await client.query(query, variables [, options]);
```

The options of the query method are used to make configure the query to hit a different API then the one specified in the constructor, and is not needed in most cases.

### FinchClient::mutation

`mutation` queries the Api and returns a properly typed response. This does not update cache like the query method does.

```typescript
const response = await client.mutation(query, variables [, options]);
```

The options of the mutation method are used to make configure the query to hit a different API then the one specified in the constructor, and is not needed in most cases.

### FinchClient::subscribe

`subscribe` listens to changes in cache for a given query. It returns a method that unsubscribes the listener.

```typescript
const unsubscribe = await client.subscribe(query, variables (updatedInfo) => {
  // Do something when the cache changes
});
```

The options of the mutation method are used to make configure the query to hit a different API then the one specified in the constructor, and is not needed in most cases.

### FinchClient::start

This starts the finch client, you do not need to call this if you have not set `autoStart` to false. This will create a port to the background process if one does not exist.

### FinchClient::stop

This disconnects the client from the background process.
