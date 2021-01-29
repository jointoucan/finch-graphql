import React from 'react'
import { Box, Input, Text, Button } from '@chakra-ui/react'

export const SettingsEditor = ({
  extensionId,
  messageKey,
  onChangeMessageKey,
  onChangeExtensionId,
}) => {
  return (
    <Box py={4} px={5}>
      <Text labelFor="messageKey">Extension ID</Text>
      <Input value={extensionId || ''} onChange={onChangeExtensionId} mb={2} />
      <Text labelFor="messageKey">Message Key</Text>
      <Input id="messageKey" value={messageKey} onChange={onChangeMessageKey} />
    </Box>
  )
}
