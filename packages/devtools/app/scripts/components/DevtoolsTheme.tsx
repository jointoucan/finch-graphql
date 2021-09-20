import { ColorModeScript } from '@chakra-ui/react'
import { FC } from 'react'
import { Theme } from './Theme'

export const DevtoolsTheme: FC = ({ children }) => {
  return (
    <>
      <ColorModeScript />
      <Theme>{children}</Theme>
    </>
  )
}
