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
} from '@chakra-ui/react'
import { useRef } from 'react'
import { FC } from 'react'
import { useColorScheme } from '../../hooks/useColorScheme'
import { useGetExtensionQuery } from '../../schema'
import { CircleIcon, SettingsIcon, DownChevronIcon } from '../Icons'
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
  const { data } = useGetExtensionQuery({
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
        {extensionInfo?.name ?? 'Switch extension'}
      </Button>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="sm"
      >
        <DrawerContent>
          <DrawerBody p={0}>
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
