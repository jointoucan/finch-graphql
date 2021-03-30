---
id: client-setup
title: Client Setup
sidebar_label: Setup client scripts
---

Client here represent content, popover or any of the other page scripts that are created internally in the extension. These scripts have a relatively small amount of setup needed because they are already connected with the background script.

## Querying information

To be able to get information from the background script you would need to write a GraphQL query, and then use the **queryApi** method to pull that information from the GraphQL API.

```typescript
import { queryApi } from 'finch-graphql'
import gql from 'graphql-tag'

const GetBrowserPermission = gql`
  query getBrowserPermission($input: PermissionsInput) {
    browser {
      permissions(input: $input)
    }
  }
`

;(async function main() {
  const resp = await queryApi(GetBrowserPermission, {
    input: { permissions: ['geolocation'] },
  })

  if (resp.data?.browser?.permissions) {
    // Do stuff with permissions
  }
})()
```

In the above example we are asking the background process if the extension has the permission of **geolocation** available to the extension. The we are able to check the response of the query to see if that permission is available. There is little to no setup here.

### Custom message keys

If you have a custom message key in your API then you can pass it in the options in the third argument of the **queryApi** function.

```typescript
const resp = await queryApi(GetBrowserPermission, {
  input: { permissions: ['geolocation'] },
}, { 
  messageKey: 'customKey' 
});
```

## React Hooks

Finch GraphQL comes packaged with React Hooks. This makes it super simple to start querying information from the graph from inside React Components. 

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

### Custom message key with hooks

To be able to pass a custom message key with hooks you can use the **ExtensionProvider** and pass the message key there. It will flow down to all the hooks in the tree.

```typescript
const { ExtensionProvider } from 'finch-graphql'

const App = () => (
  <ExtensionProvider messageKey="myCustomKey">
    {/* rest of app */}
  </ExtensionProvider>
)
```





