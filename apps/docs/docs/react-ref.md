---
id: react-ref
title: React
---

## Overview

This page covers some of the tools in the Finch React library. That allows you to easily hook into a Finch API from a React component.

## Reference

### FinchProvider

`FinchProvider` is a component that is used to provide the FinchClient to your React components, and all the hooks used in those components.

```typescript
import { FinchProvider } from '@finch-graphql/react';

const App = () => {
  return (
    <FinchProvider client={client}>
      <MyComponent />
    </FinchProvider>
  );
};
```

#### Props

`client` an instance of the FinchClient to be used by the components.

### useQuery

`useQuery` is a hook that allows you to easily query the Finch API from inside a React component. This hooks stores the result of the query and loading states of the query.

```typescript
import { useQuery } from '@finch-graphql/react';

...
  const { data, loading, error } = useQuery(query [, options)];
...
```

#### Parameters

`query` the query to be executed.

`options` an object that allows you to configure the behavior of the query, and also the variables.

`options.variables` an object that contains the variables to be used in the query.

`options.skip` if set to false, the query will not be executed, until true. **Defaults: false**

`options.pollInterval` the interval in milliseconds to poll the query. If the value is 0 the query will not poll. **Defaults: 0**

`options.poll` a boolean value that indicates if the query should be initially polled. This only needs to be used in conjunction with the `pollInterval` option if you do not want to initially poll the query.

#### Refetching

If you need to refetch the query, you can use the `refetch` function returned from the `useQuery` hook.

```typescript
...
  const { refetch } = useQuery(query [, options)];
...
```

#### Polling Controls

The useQuery hook has a few additional controls that allow you to control the polling behavior of the query.

```typescript
...
  const { data, loading, error, startPolling, stopPolling } = useQuery(query [, options)];
...
```

`startPolling` starts the polling of the query of it is not currently started.

`stopPolling` stops the polling of the query of it is not currently stopped.
