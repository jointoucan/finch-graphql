import React from 'react'
import { Box, Input, Switch, Text, IconButton } from '@chakra-ui/react'
import { CircleIcon } from './CircleIcon'
import { ClearIcon } from './ClearIcon'

interface MessagesFilterBarProps {
  onClearMessage: () => void
  currentTabOnly: boolean
  onToggleCurrentTabFilter: () => void
  filterString: string
  onFilterStringChange: React.ChangeEventHandler<HTMLInputElement>
  isRecording: boolean
  onToggleRecording: () => void
}

export const MessagesFilterBar: React.FC<MessagesFilterBarProps> = ({
  onClearMessage,
  currentTabOnly,
  onToggleCurrentTabFilter,
  filterString,
  onFilterStringChange,
  onToggleRecording,
  isRecording,
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
        onClick={onToggleRecording}
        aria-label="Clear Messages"
        mr={2}
        fill={isRecording ? 'red.500' : 'gray.600'}
        _hover={{ fill: isRecording ? 'red.300' : 'gray.400' }}
        icon={<CircleIcon />}
        variant="outline"
        borderColor="grey.200"
      />
      <IconButton
        size="sm"
        onClick={onClearMessage}
        fill="gray.600"
        aria-label="Clear Messages"
        icon={<ClearIcon />}
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
