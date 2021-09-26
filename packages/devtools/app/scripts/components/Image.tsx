import { Box, ChakraComponent } from '@chakra-ui/react';

export const Image: ChakraComponent<'img'> = ({ src, ...imgProps }) => (
  <Box as="img" src={browser.runtime.getURL(src)} {...imgProps} />
);
