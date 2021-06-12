import React, { FC } from 'react'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    teal: {
      50: '#C1E2D9',
      100: '#C1E2D9',
      200: '#65C3BC',
      300: '#3EA39A',
      400: '#2B7670',
      500: '#274F4C',
    },
    yellow: {
      50: '#FFEFD8',
      100: '#FFEFD8',
      200: '#FFE1A8',
      300: '#F8C06D',
      400: '#E07A15',
      500: '#AB5930',
    },
    grey: {
      50: '#EBEBEB',
      100: '#EBEBEB',
      200: '#CDCDCD',
      300: '#7D7D7D',
      400: '#323232',
      500: '#161616',
    },
  },
})

export const Theme: FC = ({ children }) => {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>
}
