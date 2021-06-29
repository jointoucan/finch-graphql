import { Box, Heading, Input, Text } from '@chakra-ui/react'
import { FinchMessageKey } from 'finch-graphql'
import { FC } from 'react'
import { useColorScheme } from '../../hooks/useColorScheme'
import { CircleIcon } from '../Icons'

interface CurrentExtensionProps {
  id: string
  name: string
  version: string
  icon?: string
  enabled: boolean
  messageKey: string
  setMessageKey: (messageKey: string) => void
  isConnected: boolean
}

export const CurrentExtension: FC<CurrentExtensionProps> = ({
  id,
  icon,
  name,
  version,
  messageKey,
  setMessageKey,
  isConnected,
}) => {
  const scheme = useColorScheme()
  return (
    <Box position="sticky" top={0} zIndex={10}>
      <Box
        listStyleType="none"
        display="flex"
        alignItems="center"
        borderBottom={`1px solid`}
        borderBottomColor={scheme.border}
        px={2}
        py={1}
        backgroundColor={scheme.border}
        zIndex={10}
      >
        <Text>Current targeted extension</Text>
      </Box>
      <Box
        listStyleType="none"
        display="flex"
        alignItems="flex-start"
        borderBottom={`1px solid`}
        borderBottomColor={scheme.border}
        backgroundColor={scheme.backgroundSecondary}
        p={4}
        zIndex={10}
      >
        <Box position="relative">
          <img src={icon} alt={`${name} icon`} width="36px" height="36px" />
          <CircleIcon
            fill={isConnected ? 'green.300' : scheme.border}
            position="absolute"
            bottom={-1}
            right={-1}
          />
        </Box>
        <Box pl={4} flex="1">
          <Heading
            size="sm"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            overflow="hidden"
            maxWidth="250px"
          >
            {name}
          </Heading>
          <Text>v{version}</Text>
          <Box mt={4}>
            <Text as="label" htmlFor="messageKey">
              Extension id
            </Text>
            <Input
              backgroundColor={scheme.backgroundSecondary}
              borderColor={scheme.border}
              id="messageKey"
              value={id}
              readOnly
            />
          </Box>
          <Box mt={4}>
            <Text as="label" htmlFor="messageKey">
              Message key
            </Text>
            <Input
              backgroundColor={scheme.backgroundSecondary}
              borderColor={scheme.border}
              id="messageKey"
              value={messageKey}
              onChange={e => {
                setMessageKey(e.target.value)
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
