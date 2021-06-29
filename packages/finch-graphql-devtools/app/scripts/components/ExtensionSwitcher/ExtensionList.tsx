import { Box, Heading, Text, List, ListItem } from '@chakra-ui/react'
import { FC } from 'react'
import { useColorScheme } from '../../hooks/useColorScheme'
import { useInstalledExtensions } from '../../hooks/useInstalledExtensions'

export const ExtensionList: FC<{
  setExtensionId: (id: string) => void
  currentExtensionId: string
}> = ({ setExtensionId, currentExtensionId }) => {
  const {
    extensions,
    manifest,
    error,
    requestManagementPermission,
  } = useInstalledExtensions()
  const scheme = useColorScheme()

  return (
    <Box>
      <List>
        <ListItem
          listStyleType="none"
          display="flex"
          alignItems="center"
          borderBottom={`1px solid`}
          borderBottomColor={scheme.border}
          px={2}
          py={1}
          position="sticky"
          top={245}
          backgroundColor={scheme.border}
          zIndex={10}
        >
          <Text>Switch extension</Text>
        </ListItem>
        {extensions
          .filter(({ id }) => currentExtensionId !== id)
          .map(({ id, name, icon, version }) => (
            <ListItem
              key={id}
              listStyleType="none"
              display="flex"
              alignItems="center"
              borderBottom={`1px solid`}
              borderBottomColor={scheme.border}
              p={4}
              cursor="pointer"
              onClick={() => {
                setExtensionId(id)
              }}
            >
              <Box>
                <img
                  src={icon}
                  alt={`${name} icon`}
                  width="24px"
                  height="24px"
                />
              </Box>
              <Box pl={4} flex="1">
                <Heading
                  size="xs"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  overflow="hidden"
                  maxWidth="300px"
                >
                  {name}
                </Heading>
                <Text>v{version}</Text>
              </Box>
            </ListItem>
          ))}
      </List>
    </Box>
  )
}
