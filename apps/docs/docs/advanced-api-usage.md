---
id: advanced-api-usage
title: Advanced API usage
---

## Turning off introspection

Introspection is super useful for tools like GraphiQL, but can potentially expose functionality that you do not want to expose on clients. Finch GraphQL has the ability to turn off introspection.

```typescript
const api = new FinchApi({
  typeDefs,
  resolver,
  disableIntrospection: true,
});
```

Now any type of introspection query will fail. This functionality is achieved using [GraphQL Validation](#running-validation). 

## Custom message keys

In Finch GraphQL we use a generic message key of `finch-message`, and if you wanted to have a custom message key that would be possible by passing in the custom message key to Finch GraphQL.

```typescript
const api = new FinchApi({
  typeDefs,
  resolver,
  messageKey: 'someThingSecret'
});
```

This allows you to make you connections with external source more secure by have a shared key to access the information in the extension. The also can help support older versions of Finch GraphQL.

## Using middleware

To be able to support a wide array of functionality like tracing, logging, and performances tracking Finch GraphQL has middleware functionality built into it. This is not needed for basic usage of Finch GraphQL but can give you insight in development if your queries are even being processed or how long things are taking to process.

```typescript
const logTiming = async (resolve, root, args, context, info) => {
  const timestamp = performance.now()
  const result = await resolve(root, args, context, info)
  console.log(`${info.operation.name} took ${Math.floor(performance.now() - timestamp)}ms`)
  return result
}

const api = new FinchApi({
  typeDefs,
  resolver,
  middleware: [logTiming],
})
```

In the example above we are logging the operation name and the time it takes to run the operation. This should look something like this in the console.

```text
getUserInfo took 3ms
```

There is many possibilities with this functionality, and here is a [list of modules](https://github.com/maticzav/graphql-middleware#awesome-middlewares-) that potentially can work with this middleware. 

> This middleware modules primary use cases are server side GraphQL APIs and may run into issues running in a browser environment.

## Running validation

GraphQL has built in validation and we expose that functionality to allow you to setup custom validators for graph.

```typescript
import { GraphQLError } from 'graphql';

const NoIntrospection = (context) => {
  return {
    Field(node) {
      if (node.name.value === '__schema' || node.name.value === '__type') {
        context.reportError(
          new GraphQLError('Introspection is disabled', [node]),
        );
      }
    },
  };
};

const api = new FinchApi({
  typeDefs,
  resolver,
  rules: [NoIntrospection],
});
```

Above is an internal implementation that allows use to turn off introspection. The official docs around this functionality can be found [here](https://graphql.org/graphql-js/validation/).


