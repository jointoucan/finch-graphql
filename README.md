# Finch Graphql

Finch is a library that allows you to build up a local graphql that is accessible via messaging. The is currently setup to use browser messages between the background process of a web extension and its client scripts. If you have external messaging turned on you may also query the GraphQL API from a website.

```shell
npm install --save finch-graphql
# or
yarn add finch-graphql
```

## Build out an API

The `FinchApi` class is a class that allows you to create an executable graphql schema. It is modeled to look just like the `ApolloServer` class. The only required properties in the options are `typeDefs` and `resolvers`.

```typescript
import { FinchApi } from "finch-graphql";

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
  },
};

// Create the executable schema
const api = new FinchApi({
  typeDefs,
  resolver,
});
```

### Additional options

Finch, when initializing the api, has some keys to be able to customize your api. **onQueryReponse** allows you to see all request happening, so if you want to setup some type of logging it is possible to use this hook. **messageKey** instead of useing the generic `Finch-message` you can create your own key to pass messages along with. **attachMessages** and **attachExternalMessages** will auto attach messages to the browser message queue.

## Attaching to messaging

If you do not have any existing messages you may use the `attachMessages` option to automatically attach to the runtume messages. If you have existing messages you will want to setup up the manual handler to ensure you are able to resolve async resolvers.

```typescript
import { FinchMessageKey } from "finch-graphql";

browser.runtime.onMessage.addListener((message) => {
  if (message.type === FinchMessageKey.Generic) {
    return api.onMessage(message);
  }
}, []);
```

This also has the ability to work with extenal messages but you should use the other message handler to ensure permissions between external sources can be managed differntly.

```typescript
browser.runtime.onExternalMessage.addListener((message) => {
  if (message.type === FinchMessageKey.Generic) {
    return api.onExternalMessage(message);
  }
}, []);
```

## Query from content script

This is the main reason for this library, it makes it super easy to query large amounts of data from the background script without sending multiple messages.

```typescript
import { queryApi } from "finch-graphql";

const GetBrowserPermission = `
  query getBrowserPermission($input: PermissionsInput) {
    browser {
      permissions(input: $input)
    }
  }
`(async function main() {
  const resp = await queryApi(GetBrowserPermission, {
    input: { permissions: ["geolocation"] },
  });

  if (resp.data?.browser?.permissions) {
    // Do stuff with permissions
  }
})();
```

## React Hooks

There is two hooks available to use if you are using a React application. First is the **useQuery** hook.

```typescript
const MyComponent = () => {
  const { data, error } = useQuery<Query, Variabled>(
    MyComponentQueryDoc,
    { variables: { enabled: true } }
  );

  if (error) {
    return null;
  }

  return (
    ...
  )
}
```

## Testing

Testing between your background resolvers and client scripts is now super easy. Here is a snippet of code that will connect your background resolvers to the content scripts queries. Note this is using a jest mock.

```typescript
jest.mock("finch-graphql", () => {
  const ogFinch = jest.requireActual("finch-graphql");
  const { finch } = jest.requireActual("./path-to/finch-instance");
  return {
    __esModule: true,
    ...ogFinch,
    queryApi: (query, variables) =>
      finch.onMessage({
        type: ogFinch.FinchMessageKey.Generic, // or your custom key
        query,
        variables,
      }),
  };
});
```
