---
id: website-setup
title: Website Setup
sidebar_label: Setup website messaging
---

## External messaging

External messaging is a way to allow a website to talk to your background process of the extension. Chrome [direct external messaging](https://developer.chrome.com/docs/extensions/mv3/messaging/#external-webpage) where other browsers you need to setup the ability to pass messages between a website and the background process. Finch allows you to essentially make API calls to your background process.

### Setting up extension

If you are only supporting Chrome I would recommend add in `externally_connectable` key into your manifest. This is the most direct and stable way to message Finch GraphQL from a website. Your manifest should look something like.

```json
{
  ...
  "externally_connectable": {
    "matches": ["https://yourwebsite.com/*"]
  }
  ...
}
```

If you are planning support more browsers you will need to setup a script that will proxy the messages to the background script. You can put this in your main _content_ script, but it is recommended that you make a custom content script to inject that only sets up this proxy.

> The reason you would want to setup a different script to inject is because you would want to have better control to which site are able to communicate with the background script.

To setup the proxy all you need to do is listen for documents events. Finch GraphQL has a helper method to do that.

```typescript
import { listenForDocumentQueries } from "finch-graphql";

listenForDocumentQueries();
```

Then make sure this gets injected into the proper site that you want to communicate with. You can do this through the manifest file.

```json
{
  ...
  "content_scripts": [{
    "js": ["path/to/externalMessaging.js"],
    "matches": ["https://yourwebsite.com/*"],
    "run_at": "document_end"
  }]
  ...
}
```

Now you should be able to message to the background script from any browser.

### Setting up website

Your website will need to have `finch-graphql` installed to be able to communicate with the extension. Once installed you can now create a client and query the extension.

> You will need to know the ID of your extension, on all platforms, to be able to query the extension externally. You can get this info by running something like `browser.runtime.id`.

```typescript
import { FinchClient } from "finch-graphql";

const queryDoc = `query test { foo }`;
const variables = {};
const client = new FinchClient({ id: "<your extension id>" });

const resp = await client.query(queryDoc, variables);
```

#### Usage with React

When using the React hooks you need to be able to setup the `FinchProvider` with the extension id.

```typescript
import { FinchProvider, FinchClient } from "finch-graphql";

const client = new FinchClient({ id: "<your extension id>" });

const MyApp = () => {
  return (
    <FinchProvider client={client}>
      {/* components with extension queries*/}
    </FinchProvider>
  );
};
```

Once setting you set up the extension provider in the website you should be able to use the hooks just like you would [inside of the extension](./client-setup#react-hooks).
