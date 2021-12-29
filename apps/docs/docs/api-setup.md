---
id: api-setup
title: API Setup
sidebar_label: Setup background API
slug: '/'
---

## Initialize Finch Api

The **FinchApi** class is a class that allows you to create an executable graphql schema. It is modeled to look just like the **ApolloServer** class. The only required properties in the options are typeDefs and resolvers.

```typescript
import { FinchApi } from '@finch-graphql/api';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';

// Create the executable schema
const api = new FinchApi({
  typeDefs,
  resolver,
});
```

### TypeDefs

**TypeDefs** are schemas for the GraphQL api. These can be a GraphQL document or and array of GraphQL documents. These help you define what the graph contracts of your GraphQL api.

```typescript
import gql from 'graphql-tag';

const browserSchema = gql`
  input PermissionsInput {
    origins: [String!]
    permissions: [String!]
  }

  type Browser {
    permissions(input: PermissionsInput!): Boolean!
  }

  type Query {
    browser: Browser!
  }
`;

export const typeDefs = [browserSchema];
```

The **typeDefs** exported in the example above can be passed to **FinchAPI** as the key _typeDefs_ and we now have a schema.

You can learn more about what can go into a schema in the [official GraphQL docs](https://graphql.org/learn/schema/).

### Resolvers

Resolvers are functions that can be executed in the graph that will allow your to asynchronously query or mutate data. This is the same shape as you would have setting up resolvers in **ApolloServer**.

```typescript
const browserResolvers = {
  Browser: {
    permissions: (_browser, { input }) => browser.permissions.contains(input),
  },
  Query: {
    browser: () => ({});
  }
}

export const resolvers = {
  Browser: browserResolvers.Browser,
  Query: {
    ...browserResolvers.Query
  }
}
```

The exported **resolvers** variable can now be passed to **FinchApi** to be able to setup the functions that get ran when a resolver is queried on the graph.

Read more about resolvers in the [official GraphQL docs](https://graphql.org/learn/execution/#root-fields-resolvers).

```typescript
import { FinchMessageKey } from '@finch-graphql/api';
import { api } from './graphql-api';

browser.runtime.onMessage.addListener(message => {
  if (message.type === FinchMessageKey.Generic) {
    return api.onMessage(message);
  }
  // ... do other message stuff
}, []);
```

This will allow you to have your custom messages working properly and be able to use Finch GraphQL as well.
