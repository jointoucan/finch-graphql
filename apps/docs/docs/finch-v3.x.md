---
id: finch-v3
title: Finch v3.x
---

## Whats new with Finch v3.x

Finch v3.x makes some major changes on how the client scripts are able to connect to the FinchApi. Prior to v3 all connection would via async messaging. This is still currently supported, but now the default behavior is to use port messaging. This not only removes some overhead of async messages but also will allow for things like GraphQL subscriptions now that the message passing allow pushing messages to the client.

The setup for Finch v3.x is pretty much the same as it has been from before but now there are a couple of new defaults.

- The default type of messaging is now through ports, and this can now be overwritten.
- Auto connection now is enabled by default when using any type of connection.

If you want to opt out of auto connections or ports it is possible with a little configuration.

### Turning off auto connection

```typescript
import { FinchApi, FinchNullConnection } from '@finch-graphql/api';

new FinchApi({
  ...
  connection: new FinchNullConnection(),
});
```

This will turn off all auto connections, and make it so Finch internally does not connect to any messaging system.

### Using async messaging instead of ports

```typescript
import { FinchApi, FinchMessageConnection } from '@finch-graphql/api';

new FinchApi({
  ...
  connection: new FinchMessageConnection(),
});
```

This now will use async messaging instead of ports, and all older options like custom message keys is still supported.

[Read more of about the new APIs](/docs/api-ref).

The client did not change as much as the API but there is planned future support for connection classes on the client that will allow for more control over the full connection to allow for custom types of connections.

[Looking for whats new in v2.x?](/docs/finch-v2)
