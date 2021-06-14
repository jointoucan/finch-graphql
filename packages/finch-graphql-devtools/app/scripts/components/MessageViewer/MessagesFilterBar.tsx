import React from 'react'
import { Box, Button, Input, Switch, Text, IconButton } from '@chakra-ui/react'
import { NotAllowedIcon } from '@chakra-ui/icons'

interface MessagesFilterBarProps {
  onClearMessage: () => void
  currentTabOnly: boolean
  onToggleCurrentTabFilter: () => void
  filterString: string
  onFilterStringChange: React.ChangeEventHandler<HTMLInputElement>
}

export const MessagesFilterBar: React.FC<MessagesFilterBarProps> = ({
  onClearMessage,
  currentTabOnly,
  onToggleCurrentTabFilter,
  filterString,
  onFilterStringChange,
}) => {
  return (
    <Box
      backgroundColor="grey.100"
      p={2}
      display="flex"
      alignItems="center"
      zIndex="1"
      pl={3}
      position="sticky"
      top="0"
      borderBottomWidth="1px"
      borderBottomColor="gray.200"
    >
      <IconButton
        size="sm"
        onClick={onClearMessage}
        aria-label="Clear Messages"
        icon={<NotAllowedIcon />}
        variant="outline"
        borderColor="grey.200"
      />
      <Box width="1px" height="25px" backgroundColor="grey.200" mx={2} />
      <Input
        size="sm"
        variant="outline"
        value={filterString}
        placeholder="Filter messages"
        onChange={onFilterStringChange}
        backgroundColor="white"
        type="search"
        width="250px"
        borderRadius="8px"
      />
      <Box width="1px" height="25px" backgroundColor="grey.200" mx={2} />

      <Switch
        mr={2}
        isChecked={currentTabOnly}
        onChange={onToggleCurrentTabFilter}
      />
      <Text pr={2} whiteSpace="nowrap">
        Only current tab
      </Text>
      <Box flex="1" />
    </Box>
  )
}
