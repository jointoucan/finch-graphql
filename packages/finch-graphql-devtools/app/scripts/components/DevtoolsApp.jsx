import { queryApi, FinchMessageKey } from 'finch-graphql'
import React, { useMemo } from 'react'
import { Tabs, TabPanels, TabPanel } from '@chakra-ui/react'
import GraphiQL from 'graphiql'
import { Header } from './Header'
import { SettingsEditor } from './SettingsEditor'
import { StorageKey, DefaultQuery } from '../constants'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { Theme } from './Theme'

export const graphQLFetcher = ({ messageKey, extensionId }) => async ({
  query,
  variables,
}) => {
  return queryApi(query, variables || {}, {
    messageKey,
    id: extensionId,
  })
}

export const DevtoolsApp = () => {
  const [extensionId, setExtensionId] = useLocalStorage(
    StorageKey.ExtensionId,
    '',
  )
  const [messageKey, setMessageKey] = useLocalStorage(
    StorageKey.MessageKey,
    FinchMessageKey.Generic,
  )
  const [tabIndex, setTabIndex] = useLocalStorage(StorageKey.TabIndex, 0)

  const fetcher = useMemo(() => {
    return graphQLFetcher({ messageKey, extensionId })
  }, [messageKey, extensionId])

  return (
    <Theme>
      <Tabs
        colorScheme="blue"
        onChange={index => setTabIndex(index)}
        defaultIndex={tabIndex}
      >
        <Header />
        <TabPanels>
          <TabPanel p="0">
            <GraphiQL fetcher={fetcher} defaultQuery={DefaultQuery} />
          </TabPanel>
          <TabPanel p="0">
            <SettingsEditor
              extensionId={extensionId}
              onChangeExtensionId={id => {
                setExtensionId(id)
              }}
              messageKey={messageKey}
              onChangeMessageKey={e => {
                setMessageKey(e.target.value)
              }}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Theme>
  )
}
