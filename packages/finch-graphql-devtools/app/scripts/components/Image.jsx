import React from 'react'
import { Box } from '@chakra-ui/react'

export const Image = ({ src, ...imgProps }) => (
  <Box as="img" src={browser.runtime.getURL(src)} {...imgProps} />
)
