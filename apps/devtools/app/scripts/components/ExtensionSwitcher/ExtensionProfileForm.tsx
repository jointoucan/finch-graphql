import { Box, Input, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { useColorScheme } from '../../hooks/useColorScheme';
import { ConnectionInfo } from '../types';

interface ExtensionProfileFormProps {
  extensionId: string;
  readOnlyExtensionId?: boolean;
  onExtensionIdChange: (extensionId: string) => void;
  connectionInfo?: ConnectionInfo;
}

export const ExtensionProfileForm: FC<ExtensionProfileFormProps> = ({
  extensionId,
  readOnlyExtensionId = false,
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
    </>
  );
};
