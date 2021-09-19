import React, { FC } from 'react';
import { Box } from '@chakra-ui/react';
import { useColorScheme } from '../hooks/useColorScheme';

export const Code: FC<{ code: string }> = ({ code }) => {
  const scheme = useColorScheme();
  return (
    <Box as="pre" p={4} rounded={8} mb={3} overflow="scroll">
      <Box
        as="code"
        color={scheme.highlightSecondary}
        overflow="scroll"
        whiteSpace="break-spaces"
      >
        {code}
      </Box>
    </Box>
  );
};
