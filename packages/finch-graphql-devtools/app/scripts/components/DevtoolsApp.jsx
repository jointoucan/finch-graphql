import { queryApi, FinchMessageKey } from 'finch-graphql'
import React, { useMemo, useState } from 'react'
import GraphiQL from 'graphiql'
import { Header } from './Header'

export const graphQLFetcher = ({ messageKey, extensionId }) => ({ query, variables }) =>
  queryApi(query, variables || {}, { messageKey, id: extensionId })

const defaultQuery = `
# Welcome to GraphiQL for Finch GraphQL
#
# GraphiQL is an in-browser tool for writing, validating, and
# testing GraphQL queries. Try it out.
#

query getExtensionInfo {
  browser {
    manifest {
      name
      version
    }
  }
}`


export const DevtoolsApp = () => {
  const [extensionId, setExtensionId] = useState();
  const [messageKey, setMessageKey] = useState(FinchMessageKey.Generic);
  const fetcher = useMemo(() => {
    return graphQLFetcher({ messageKey, extensionId });
  }, [messageKey, extensionId]);


  return <React.Fragment><Header /><GraphiQL fetcher={fetcher} defaultQuery={defaultQuery} /></React.Fragment>;
}
