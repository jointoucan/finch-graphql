---
id: finch-v2
title: Finch v2.x
---

## Whats new with Finch v2.x

Before v2.x we essentially made you install all of Finch GraphQL, which was the server, and the React hooks. This made for some pretty large installs and the need to install a few extra dependencies that you could potentially not even be using. v2 tackles this by separating out the API, client, and vendor integrations into their own packages. This does mean you may need to manually install some of the Finch dependencies, but you will no longer be installing things you do not need.

There are now two main packages, and one optional package. The main packages are:

### @finch-graphql/api

This runs the GraphQL server. In your extension you will need to install this package to create a schema and resolvers. This is the largest of the packages in Finch and is only required in the extension.

```typescript
import { FinchApi } from '@finch-graphql/api';

export const finchApi = new FinchApi({
  typeDefs: typeDefs,
  resolvers: resolvers,
});
```

### @finch-graphql/client

This is the client that will be used to query the background process. This is the package that handles sending messages to the background process, and can be installed into the extension or a website.

```typescript
import { FinchClient, QueryCache } from '@finch-graphql/client';

export const finchApi = new FinchClient({
  cache: new QueryCache(),
});
```

### @finch-graphql/react

This is a React packages that turns the client into a React hooks. This is useful if you content script or website is in React, and you want to query the background process from within your React application.

```typescript
import { FinchProvider, useQuery } from '@finch-graphql/react';

const Content = () => {
  const { data } = useQuery(getExtensionVersionDocument);
  const name = data?.getData.browser.manifest.name;
  const version = data?.getData.browser.manifest.version;

  return (
    <p>
      {name} {version}
    </p>
  );
};

const App = () => {
  return;
  <FinchProvider client={finchClient}></FinchProvider>;
};
```

### Other frameworks

We currently are not supporting any frameworks, but with this new structure the integration with other frameworks should be possible. We are looking forward to what the community come up with!
