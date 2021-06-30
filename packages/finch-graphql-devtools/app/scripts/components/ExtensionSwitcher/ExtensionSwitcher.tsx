import {
  Box,
  Text,
  Heading,
  IconButton,
  Button,
  Drawer,
  DrawerContent,
  DrawerBody,
  DrawerOverlay,
  Input,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react'
import { useRef } from 'react'
import { FC } from 'react'
import { useColorScheme } from '../../hooks/useColorScheme'
import { useGetExtensionQuery } from '../../schema'
import { CircleIcon, InfoIcon, RefreshIcon } from '../Icons'
import { CurrentExtension } from './CurrentExtension'
import { ExtensionList } from './ExtensionList'
import { ExtensionProfileForm } from './ExtensionProfileForm'
import { NoPermissionDrawer } from './NoPermissionDrawer'

interface ExtensionSwitcherProps {
  isConnected: boolean
  extensionId?: string
  messageKey: string
  setMessageKey: (messageKey: string) => void
  setExtensionId: (extensionId: string) => void
}

export const ExtensionSwitcher: FC<ExtensionSwitcherProps> = ({
  isConnected,
  extensionId,
  messageKey,
  setMessageKey,
  setExtensionId,
}) => {
  const scheme = useColorScheme()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()
  const { data, refetch } = useGetExtensionQuery({
    variables: { id: extensionId },
  })

  const extensionInfo = data?.browser?.extension
  const hasManagementPermission = data?.browser?.permission ?? false

  return (
    <>
      <Button
        size="xs"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        border={`1px solid`}
        borderRadius="8px"
        px={2}
        cursor="pointer"
        textAlign="left"
        variant="outline"
        borderColor={scheme.border}
        onClick={onOpen}
        ref={btnRef}
        leftIcon={
          <CircleIcon
            fill={isConnected ? 'green.300' : scheme.border}
            mt="-2px"
          />
        }
      >
        {extensionInfo?.name ??
          (extensionId ? 'Extension Status' : 'Setup Extension')}
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="sm"
        autoFocus={false}
      >
        <DrawerContent backgroundColor={scheme.background}>
          <DrawerBody p={0}>
            <Box
              borderBottom={`1px solid`}
              borderBottomColor={scheme.border}
              p={2}
              display="flex"
              flexDirection="row"
              justifyContent="flex-end"
            >
              <Tooltip
                label="Refresh frame"
                openDelay={500}
                placement="bottom-end"
              >
                <IconButton
                  size="xs"
                  mr={1}
                  aria-label="Refresh frame"
                  fill={scheme.foreground}
                  icon={<RefreshIcon />}
                  onClick={() => {
                    window.location.reload()
                  }}
                  variant="outline"
                  borderColor={scheme.border}
                />
              </Tooltip>
              <Tooltip
                label="See setup documentation"
                openDelay={500}
                placement="bottom-end"
              >
                <IconButton
                  size="xs"
                  aria-label="See setup documentation"
                  mr={2}
                  fill={scheme.foreground}
                  icon={<InfoIcon />}
                  onClick={() => {
                    window.open(
                      'https://jointoucan.github.io/finch-graphql/docs/devtools',
                      '_blank',
                    )
                  }}
                  variant="outline"
                  borderColor={scheme.border}
                />
              </Tooltip>
            </Box>
            {hasManagementPermission ? (
              <>
                {extensionInfo && (
                  <CurrentExtension
                    {...extensionInfo}
                    isConnected={isConnected}
                  >
                    <ExtensionProfileForm
                      extensionId={extensionId}
                      onExtensionIdChange={() => {}}
                      readOnlyExtensionId
                      messageKey={messageKey}
                      onMessageKeyChange={setMessageKey}
                    />
                  </CurrentExtension>
                )}
                <ExtensionList
                  hasCurrentExtension={!!extensionInfo}
                  currentExtensionId={extensionId}
                  setExtensionId={setExtensionId}
                />
              </>
            ) : (
              <NoPermissionDrawer>
                <ExtensionProfileForm
                  extensionId={extensionId}
                  onExtensionIdChange={setExtensionId}
                  messageKey={messageKey}
                  onMessageKeyChange={setMessageKey}
                />
              </NoPermissionDrawer>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
