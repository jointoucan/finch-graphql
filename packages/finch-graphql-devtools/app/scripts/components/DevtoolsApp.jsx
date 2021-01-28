import { queryApi, FinchMessageKey } from 'finch-graphql'
import React, { useMemo, useState } from 'react'
import { Tabs, TabPanels, TabPanel, ChakraProvider } from '@chakra-ui/react'
import GraphiQL from 'graphiql'
import { Header } from './Header'
import { SettingsEditor } from './SettingsEditor'
import { StorageKey } from '../constants'
import { useLocalStorage } from '../hooks/useLocalStorage'

export const graphQLFetcher = ({ messageKey, extensionId }) => async ({
  query,
  variables,
}) => {
  const resp = await queryApi(query, variables || {}, {
    messageKey,
    id: extensionId,
  })
  console.log(resp)
  return resp
}

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
  const [extensionId, setExtensionId] = useLocalStorage(
    StorageKey.ExtensionId,
    '',
  )
  const [messageKey, setMessageKey] = useLocalStorage(
    StorageKey.MessageKey,
    FinchMessageKey.Generic,
  )

  const fetcher = useMemo(() => {
    return graphQLFetcher({ messageKey, extensionId })
  }, [messageKey, extensionId])

  return (
    <ChakraProvider>
      <Tabs>
        <Header />
        <TabPanels>
          <TabPanel p="0">
            <GraphiQL fetcher={fetcher} defaultQuery={defaultQuery} />
          </TabPanel>
          <TabPanel p="0">
            <SettingsEditor
              extensionId={extensionId}
              onChangeExtensionId={e => {
                setExtensionId(e.target.value)
              }}
              messageKey={messageKey}
              onChangeMessageKey={e => {
                setMessageKey(e.target.value)
              }}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ChakraProvider>
  )
}
