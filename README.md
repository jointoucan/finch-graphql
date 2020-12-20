# Tanager Graphql

Tanager is a library that allows you to build up a local graphql that is accessible via messaging. The is currently setup to use browser messages between the background process of a web extension and its client scripts.

```shell
npm install --save tanager-graphql
# or
yarn add tanager-graphql
```

## Build out an API

The `TanagerApi` class is a class that allows you to create an executable graphql schema. It is modeled to look just like the `ApolloServer` class. The only required properties in the options are `typeDefs` and `resolvers`.

```typescript
import { TanagerApi } from 'tanager-graphql'

// Define your schema
const typeDefs = `
  input PermissionsInput {
    permissions: [String!]
  }

  type Browser {
    permissions($input: PermissionsInput)
  }

  type Query {
    browser: Browser
  }
`;

// Defined resolvers
const resolvers = {
  Browser: (parent, { input }) => {
    return browser.premissions.contains(input);
  }
};

// Create the executable schema
const api = new TanagerApi({
  typeDefs,
  resolver,
});
```

## Attaching to messaging

If you do not have any existing messages you may use the `attachMessages` option to automatically attach to the runtume messages. If you have existing messages you will want to setup up the manual handler to ensure you are able to resolve async resolvers.

```typescript
import { TanagerMessageKey } from 'tanager-graphql'; 

browser.runtime.onMessage.addListener((message) => {
  if (message.type === TanagerMessageKey.Generic) {
    return api.onMessage(message);
  }
}, []);
```

This also has the ability to work with extenal messages but you should use the other message handler to ensure permissions between external sources can be managed differntly.

```typescript
browser.runtime.onExternalMessage.addListener((message) => {
  if (message.type === TanagerMessageKey.Generic) {
    return api.onExternalMessage(message);
  }
}, []);
```

## Query from content script

This is the main reason for this library, it makes it super easy to query large amounts of data from the background script without sending multiple messages.

```typescript
import { queryApi } from 'tanager-graphql'

const GetBrowserPermission = `
  query getBrowserPermission($input: PermissionsInput) {
    browser {
      permissions(input: $input)
    }
  }
`

(async function main() {
  const resp = await queryApi(GetBrowserPermission, {
    input: { permissions: ['geolocation'] }
  })
  
  if (resp.data?.browser?.permissions) {
    // Do stuff with permissions
  }
})()
```

