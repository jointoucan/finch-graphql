import { Icon, IconProps } from '@chakra-ui/icons'
import { Box } from '@chakra-ui/react'

export const CircleIcon: React.FC<IconProps> = props => {
  return (
    <Icon viewBox="0 0 100 100" {...props}>
      <Box as="circle" cx="50" cy="50" r="50" />
    </Icon>
  )
}
