![Finch GraphQL](./assets/finch-graphql.svg)

# Finch GraphQL

Finch GraphQL is a library that allows you to build up a local GraphQL API that is accessible via client scripts of an web extension. When [external messaging](https://developer.chrome.com/docs/extensions/mv2/messaging/#external-webpage) is setup you may even query Finch GraphQL from a connectable website.

## Install

```shell
npm install --save @finch-graphql/api @finch-graphql/client graphql react
# or
yarn add @finch-graphql/api @finch-graphql/client graphql react
```

> ⚛ Currently React is needed for the included React hooks

## How it works

Traditional implementation of GraphQL pass queries through HTTP, Finch GraphQL passes these queries though the [browsers messaging system](https://developer.chrome.com/docs/extensions/mv3/messaging/).

![Diagram](./assets/diagram.svg)

Checkout an [example extension](https://github.com/jcblw/finch-bookmarks).

## Why?

Message passing is one of the main means of communication for content scripts to be able to access network request and access to local storage APIs like IndexDB. Using GraphQL gives you some powerful abilities when using this messaging.

- **Declarative**: Imperative code can be hard to structure. Background scripts can become a confusing when imperatively connecting to events. GraphQL resolvers gives you structure on how to write your background script.
- **Error handling**: If a error happens in the background script it will be surfaced to the client script. Writing code into resolvers GraphQL will catch the errors that happen on the background script.
- **Common patterns**: GraphQL and React are common technology for the web, and when using them in a web extension it strips away some of the nuance of building an extension. This make extension development more accessible to backend and frontend developers.

## Build out an API

The `FinchApi` class is a class that allows you to create an executable graphql schema. It is modeled to look just like the `ApolloServer` class. The only required properties in the options are `typeDefs` and `resolvers`.

```typescript
import { FinchApi } from 'finch-graphql';

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
    return browser.permissions.contains(input);
  },
};

// Create the executable schema
const api = new FinchApi({
  typeDefs,
  resolver,
});
```

### Additional options

When initializing the api Finch has some options to be able to customize your API.

| **Option**                 | **Type**            | **Description**                                                                               |
| -------------------------- | ------------------- | --------------------------------------------------------------------------------------------- |
| **messageKey**             | _string_            | Use a custom message key instead of using the generic `Finch-message`                         |
| **attachMessages**         | _boolean_           | Auto attach browser messaging.                                                                |
| **attachExternalMessages** | _boolean_           | Auto attach external browser messaging.                                                       |
| **middleware**             | _MiddlewareFN[]_    | Middleware provided by [graphql-middleware](https://www.npmjs.com/package/graphql-middleware) |
| **disableIntrospection**   | _boolean_           | If true introspection queries will be turned off.                                             |
| **rules**                  | _ValidationRules[]_ | [GraphQL validation](https://graphql.org/graphql-js/validation/) rules                        |

## Attaching to messaging

If you do not have any existing messages you may use the `attachMessages` option to automatically attach to the runtime messages. If you have existing messages you will want to setup up the manual handler to ensure you are able to resolve async resolvers.

```typescript
import { FinchMessageKey } from 'finch-graphql';

browser.runtime.on[External]Message.addListener(message => {
  if (message.type === FinchMessageKey.Generic) {
    return api.on[External]Message(message);
  }
}, []);
```

## Query from content script

This is the main reason for this library, it makes it super easy to query large amounts of data from the background script without sending multiple messages.

```typescript
import { queryApi } from 'finch-graphql';

const GetBrowserPermission = `
  query getBrowserPermission($input: PermissionsInput) {
    browser {
      permissions(input: $input)
    }
  }
`(async function main() {
  const resp = await queryApi(GetBrowserPermission, {
    input: { permissions: ['geolocation'] },
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
  const { data, error } = useQuery<QueryTypes, VariableTypes>(
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
import { backgroundApiInstance } from '~/background/graphql';

// This will connect the background resolvers to the client scripts when called.
export const connectBackgroundResolvers = () => {
  browser.runtime.sendMessage = jest
    .fn()
    .mockImplementation((message, sender) =>
      backgroundApiInstance.onMessage(message, sender),
    );
};
```
