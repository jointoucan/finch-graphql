import { Box, Input, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { useColorScheme } from '../../hooks/useColorScheme';

interface ExtensionProfileFormProps {
  extensionId: string;
  readOnlyExtensionId?: boolean;
  messageKey: string;
  onExtensionIdChange: (extensionId: string) => void;
  onMessageKeyChange: (messageKey: string) => void;
}

export const ExtensionProfileForm: FC<ExtensionProfileFormProps> = ({
  extensionId,
  readOnlyExtensionId = false,
  messageKey,
  onMessageKeyChange,
  onExtensionIdChange,
}) => {
  const scheme = useColorScheme();
  return (
    <>
      <Box mt={4}>
        <Text as="label" htmlFor="extensionId">
          Extension id
        </Text>
        <Input
          backgroundColor={scheme.backgroundSecondary}
          borderColor={scheme.border}
          id="extensionId"
          value={extensionId}
          onChange={e => {
            onExtensionIdChange(e.target.value);
          }}
          readOnly={readOnlyExtensionId}
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
            onMessageKeyChange(e.target.value);
          }}
        />
      </Box>
    </>
  );
};
