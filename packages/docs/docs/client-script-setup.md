---
id: client-setup
title: Client Setup
sidebar_label: Setup client scripts
---

The client represents content, popover or any of the other page scripts that are created internally in the extension. These scripts have a relatively small amount of setup needed because they are already connected with the background script. To install run `npm install @finch-graphql/client --save`.

## Configuring your client

Finch GraphQL has a FinchClient class that is the client version of the FinchApi class. This allows you to configure your client to include things like custom message keys and caching.

```typescript
import { FinchClient, QueryCache } from '@finch-graphql/client';

const cache = new QueryCache();
// Cache is optional
export const client = new FinchClient({ cache });
```

## Querying information

To be able to get information from the background script you would need to write a GraphQL query, and then use the **client** method to pull that information from the GraphQL API.

```typescript
import { client } from './finch-client';
import gql from 'graphql-tag';

const GetBrowserPermissionDoc = gql`
  query getBrowserPermission($input: PermissionsInput) {
    browser {
      permissions(input: $input)
    }
  }
`;

(async function main() {
  const resp = await client.query(GetBrowserPermissionDoc, {
    input: { permissions: ['geolocation'] },
  });

  if (resp.data?.browser?.permissions) {
    // Do stuff with permissions
  }
})();
```

There is also a very similar method that will allow you to make mutations against the background API as well.

```typescript
await client.mutate(RequestPermissionDoc, {
  input: { permissions: ['geolocation'] },
});
```

In the above example we are asking the background process if the extension has the permission of **geolocation** available to the extension. The we are able to check the response of the query to see if that permission is available. There is little to no setup here.

### Custom message keys

If you have a custom message key in your API then you can pass it to the constructor of the client.

```typescript
new FinchClient({
  messageKey: 'secret',
});
```

### Caching

Mentioned in setup of the client you can pass a instance of **QueryCache** to the FinchClient. This will allow you to keep queries up to date across the codebase by sharing cache between the results. This currently is automatically setup with the React hooks, but subscription methods are exposed on the clients.

```typescript
const client = new FinchClient({
  cache: new QueryCache(),
});

const unsubscribe = client.subscribe(doc, variables, () => {
  console.log('Ive got an update');
});
```

The return of a subscribe method will be a function that will unsubscribe you from the updates to the cache key.

## React Hooks

Finch GraphQL comes packaged with React Hooks. This makes it super simple to start querying information from the graph from inside React Components.

### FinchProvider

The FinchClient can then be passed to the **FinchProvider** when using the client with React. This makes the client available to all of the other hooks in this section.

```typescript
import { FinchProvider, FinchClient } from '@finch-graphql/react';

const client = new FinchClient();

const MyApp = () => {
  return (
    <FinchProvider client={client}>
      {/* All your components go here */}
    </FinchProvider>
  );
};
```

### useQuery

This hook queries information when the component is rendered, and exposes a few pieces of data to allow you to control your component until the data is present.

```typescript
const { useQuery } from 'finch-graphql'

const MyComponent = () => {
  const { data, loading, error } = useQuery(GetBrowserPermission, {
    variables: { input: { permissions: ['geolocation'] } },
  })

  if (loading) {
    // show loading state
    return null
  }

  if (error) {
    // show error state
    return <>{error.message}</>
  }

  const hasPermission = data?.browser?.permissions;

  // do stuff with data
  return ...
}
```

In the example above we are fetching the same data in the other example but in this example we are rendering a React component, and rendering different states based on the state of the API query.

### useMutation

This hook allows for graphQL mutations sets up a mutation but then only will execute the mutation once a returned function is called.

```typescript
const { useMutation } from 'finch-graphql'

const MyComponent = () => {
  const [requestPermissions, { data, error }] = useMutation(RequestPermissionsDoc);

  const onClick = async () => {
    await requestPermissions({ input: { permissions: ['geolocation'] });
  }

  return (
    <>
      {error ? <p>{error.message}</p> : null}
      <button onClick={onClick}>Request Geolocation Permission</button>
    </>
  )
}
```

In the above example we setup a mutation that is going to request a permission from the background script. If an error happens we will show it and we can also confirm that it was successful though the data parameter.
