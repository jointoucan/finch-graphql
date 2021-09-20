---
id: how-it-works
title: How it works
---

## GraphQL over messages

Most implementations of GraphQL use **HTTP** to pass queries and mutations to a server, but using HTTP is not required with GraphQL. GraphQL can be boiled down to a schema for contracts between two processes. Finch GraphQL uses GraphQL in a way were it passes queries and mutations over the browser built in **[messaging passing](https://developer.chrome.com/docs/extensions/mv3/messaging/)** APIs for browser extensions. You can think of this implementation of GraphQL almost exactly the same as you would have on a server but the protocol to which you talk to the API is different.

Below is attached a simple graph of where Finch GraphQL runs in relation to your other scripts in an extension.

![Finch GraphQL Process Graph](/img/process-graph.svg)
