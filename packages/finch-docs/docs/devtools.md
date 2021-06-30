---
id: devtools
title: Finch GraphiQL Devtools
---

Finch GraphiQL Devtools is an [Chrome extension](https://chrome.google.com/webstore/detail/finch-graphiql-devtools/lppmnandcophphjneeabhnioijpdjdnc). This extension has an instance of [GraphiQL](https://github.com/graphql/graphiql/tree/main/packages/graphiql) with some custom tools to be able to have full introspection of a Finch GraphQL API, and also message introspection like you would have with network request when working with a remote GraphQL API.

![Finch GraphiQL Screen Shot](/img/devtools-screen-shot.png)

[Get it on the Chrome Web Store](https://chrome.google.com/webstore/detail/finch-graphiql-devtools/lppmnandcophphjneeabhnioijpdjdnc)

## Setup

#### Connecting your extension to the devtools

You will need to setup your extension to be able to [communicate with external extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/externally_connectable). You just need to modify your manifest to contain the following lines.

```json
{
  "externally_connectable": {
    "ids": ["lppmnandcophphjneeabhnioijpdjdnc"]
  }
}
```

This is the id of the devtools. This is pretty safe to ship with in your production manifest, and you will receive no warnings submitting this with your extension. If you are worried about people accessing your graph schema you can add something like this to the initialization of your you Finch GraphQL API.

```typescript
new FinchApi({
  // Disables introspection of the graph
  // Disables message key auto lookup
  disableIntrospection: process.env.NODE_ENV === "production",
});
```

This will let you still inspect messages to your Finch GraphQL API, without exposing the GraphQL schema or any information on how to connect to the messages.

#### Configuring devtools to talk to your extension

To setup the devtools you will need the [devtools extension](https://chrome.google.com/webstore/detail/finch-graphiql-devtools/lppmnandcophphjneeabhnioijpdjdnc) installed. Once installed there will be a `Extension Setup` button in the top right of the extension.

This button will open up a drawer where you can paste in your extensions id and if you have a custom message key. You can also paste it in here.

##### Optional permissions

You may see an up-sell for some optional permissions. This permission is the [management](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/management) permission and it is pretty powerful. Finch GraphiQL devtools uses this API to get a list of installed extensions that you can connect to. This is the recommended way to use Finch GraphiQL devtools because it allows you to seamlessly change between different version of your extension or even other extensions your are developing.

### Caveat

The Finch GraphiQL devtools with only work on Chromium based browsers like Chrome, Edge, and Brave. There is currently no plans to support other browsers with these devtools.
