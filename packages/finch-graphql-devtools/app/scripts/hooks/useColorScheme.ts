import { useColorMode } from '@chakra-ui/react'
import { colorScheme } from '../styles/colorScheme'

export const useColorScheme = () => {
  const { colorMode } = useColorMode()
  return colorScheme[colorMode]
}
