---
id: devtools
title: Finch GraphiQL Devtools
---

Finch GraphiQL Devtools is an Chrome extension that packages [GraphiQL](https://github.com/graphql/graphiql/tree/main/packages/graphiql) with some custom tools to be able to have full introspection of a Finch GraphQL API.

![Finch GraphiQL Screen Shot](/img/devtools-screen-shot.png)

[Get it on the Chrome Web Store](https://chrome.google.com/webstore/detail/finch-graphiql-devtools/ncphbokbnlcnikepjhngegjimgikpgeg?hl=en&authuser=1)

To setup the devtools to communicate with your extension, open up the devtools on a page or background script and open up the settings tab. This should contain further instructions, with the correct extension ids.

### Caveats

These devtools currently only work in Chrome because of how Chrome allows to extensions to pass messages to one another through external messaging, which is not supported by other browsers.
