import React from 'react'
import {
  Box,
  Input,
  Text,
  Heading,
  Select,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useInstalledExtensions } from '../hooks/useInstalledExtensions'

const defaultBoxShadow = '0 2px 2px -1px rgb(0 0 0 / 26%)'

export const SettingsEditor = ({
  extensionId,
  messageKey,
  onChangeMessageKey,
  onChangeExtensionId,
}) => {
  const { extensions, manifest, error } = useInstalledExtensions()

  const codeBlock = `"externally_connectable": {
    "ids": ["${(manifest && manifest.id) || 'extensionId'}"]
}`

  return (
    <Box py={4} px={5} display="flex">
      <Box flex={1} pr={6} maxWidth="400px">
        {error && (
          <Alert status="error" rounded={8}>
            <AlertIcon />
            {error.message}
          </Alert>
        )}
        <Heading pt={3} pb={1} as="h3" size="md">
          Settings
        </Heading>
        <Text pb={1}>
          This pages helps you config Finch GraphiQL to talk to your Finch
          GraphQL background.
        </Text>
        <Text pb={3}>
          You will need to add this extensions id to your extensions manifest as
          a externally connectable extensions.
        </Text>
        <Box as="pre" p={4} bg="grey.500" rounded={8} mb={3}>
          <Box as="code" color="yellow.100">
            {codeBlock}
          </Box>
        </Box>
        <Alert colorScheme="yellow" rounded={8} pb={3}>
          <AlertIcon />
          This will not cause any warnings, when submitting your extension.
        </Alert>
        <Text pt={3} pb={3}>
          If your extension has a custom message key you can add it here.
        </Text>
        <Input
          backgroundColor="white"
          placeholder="Message Key"
          id="messageKey"
          value={messageKey}
          onChange={onChangeMessageKey}
        />
      </Box>
      <Box flex={1}>
        <Text pt={3} pb={3}>
          Next, you will need to select your extension from the list of
          extensions below. Depending on how you load your extensions for
          development this may change often.
        </Text>
        <Box display="flex" flexWrap="wrap">
          {extensions.map(({ id, name, version, icon }) => {
            const isSelected = id === extensionId
            return (
              <Box
                onClick={() => {
                  onChangeExtensionId(id)
                }}
                outline="none"
                role="button"
                tabIndex={0}
                key={id}
                rounded={8}
                shadow="md"
                flex="0"
                minWidth="300px"
                mr={2}
                mb={2}
                backgroundColor={isSelected ? 'blue.100' : 'white'}
                p={3}
                display="flex"
                alignItems="center"
                transition="all 0.3s ease"
                boxShadow={
                  isSelected
                    ? `inset 0 0 0 2px #4299e1, ${defaultBoxShadow}`
                    : `inset 0 0 0 0 #4299e1, ${defaultBoxShadow}`
                }
              >
                <Box as="img" src={icon} width="45px" height="45px" mr={2} />
                <Box flex="1" overflow="hidden">
                  <Text color={isSelected ? 'blue.400' : 'grey.300'}>{id}</Text>
                  <Heading size="xs" whiteSpace="nowrap">
                    {name}
                  </Heading>
                  <Text color={isSelected ? 'blue.400' : 'grey.300'}>
                    v{version}
                  </Text>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
