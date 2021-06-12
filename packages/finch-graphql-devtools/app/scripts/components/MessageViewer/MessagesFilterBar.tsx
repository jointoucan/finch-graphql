import React from 'react'
import { Box, Button, Input, Switch, Text } from '@chakra-ui/react'

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
    >
      <Input
        mr={2}
        size="sm"
        variant="outline"
        value={filterString}
        placeholder="Filter messages"
        onChange={onFilterStringChange}
        backgroundColor="white"
        type="search"
        width="250px"
      />
      <Switch
        mr={2}
        isChecked={currentTabOnly}
        onChange={onToggleCurrentTabFilter}
      />
      <Text pr={2} whiteSpace="nowrap">
        Only current tab
      </Text>
      <Box flex="1" />
      <Button
        size="xs"
        variant="ghost"
        onClick={onClearMessage}
        colorScheme="grey"
      >
        Clear messages
      </Button>
    </Box>
  )
}
