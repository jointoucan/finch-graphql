import React, { useEffect } from 'react'
import { Box, Button, Flex, Input, Switch, Text } from '@chakra-ui/react'

export const MessagesFilterBar = ({
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
      <Switch
        mr={2}
        isChecked={currentTabOnly}
        onChange={onToggleCurrentTabFilter}
      />
      <Text pr={2} whiteSpace="nowrap">
        Only current tab
      </Text>
      <Input
        mr={2}
        size="sm"
        variant="filled"
        value={filterString}
        placeholder="Filter messages"
        onChange={onFilterStringChange}
        type="search"
      />
      <Box flex="1" />
      <Button size="xs" onClick={onClearMessage}>
        Clear messages
      </Button>
    </Box>
  )
}
