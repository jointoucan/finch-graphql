import { Icon, IconProps } from '@chakra-ui/icons'
import { Box } from '@chakra-ui/react'

export const ClearIcon: React.FC<IconProps> = props => {
  return (
    <Icon viewBox="0 0 16 16" {...props}>
      <path
        fill-rule="evenodd"
        d="M1.5 8a6.5 6.5 0 0110.535-5.096l-9.131 9.131A6.472 6.472 0 011.5 8zm2.465 5.096a6.5 6.5 0 009.131-9.131l-9.131 9.131zM8 0a8 8 0 100 16A8 8 0 008 0z"
      ></path>
    </Icon>
  )
}
