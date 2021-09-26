import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useRequestManagementPermissionMutation } from '../../schema';

export const NoPermissionDrawer: FC = ({ children }) => {
  const scheme = useColorScheme();
  const [
    requestManagementPermission,
    { loading },
  ] = useRequestManagementPermissionMutation();
  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        borderBottom={`1px solid`}
        borderBottomColor={scheme.border}
        px={2}
        py={1}
        backgroundColor={scheme.border}
        zIndex={10}
      >
        <Text>Current extension settings</Text>
      </Box>
      <Box px={8} pb={4}>
        {children}
      </Box>
      <Box
        display="flex"
        alignItems="center"
        borderBottom={`1px solid`}
        borderBottomColor={scheme.border}
        zIndex={10}
      />
      <Box p={8} backgroundColor={scheme.backgroundSecondary}>
        <Heading size="md" pb={4}>
          Swap easily between dev and staging extensions
        </Heading>
        <Text pb={4}>
          Finch GraphiQL devtools has the ability to get a list of your
          installed extensions, and let you toggle between debugging those
          extensions. To get the list of extensions Finch GraphiQL devtools need
          an additional permission called management. We respect your privacy
          and will never send any this information outside of your local
          environment.
        </Text>
        <Button
          variant="outline"
          borderColor={scheme.border}
          onClick={async () => {
            await requestManagementPermission({});
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }}
          disabled={!!loading}
        >
          {loading ? 'Requesting permission...' : 'Add management permission'}
        </Button>
        <Text pt={4}>
          After this permission is accepted we are going to reload the extension
          with the new permissions. You can open back up the extension
          selections panel, after the reload.
        </Text>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        borderBottom={`1px solid`}
        borderBottomColor={scheme.border}
        zIndex={10}
      />
    </>
  );
};
