import React from 'react'
import { Box } from '@chakra-ui/react'

export const Code = ({ code }) => {
  return (
    <Box as="pre" p={4} rounded={8} mb={3} overflow="scroll">
      <Box
        as="code"
        color="blue.500"
        overflow="scroll"
        whiteSpace="break-spaces"
      >
        {code}
      </Box>
    </Box>
  )
}
