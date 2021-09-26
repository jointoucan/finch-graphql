import React from 'react';
import {
  Box,
  Input,
  Switch,
  Text,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { CircleIcon, ClearIcon } from '../Icons';
import { useColorScheme } from '../../hooks/useColorScheme';

interface MessagesFilterBarProps {
  onClearMessage: () => void;
  currentTabOnly: boolean;
  onToggleCurrentTabFilter: () => void;
  filterString: string;
  onFilterStringChange: React.ChangeEventHandler<HTMLInputElement>;
  isRecording: boolean;
  onToggleRecording: () => void;
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
  const scheme = useColorScheme();
  return (
    <Box
      backgroundColor={scheme.backgroundSecondary}
      p={2}
      display="flex"
      alignItems="center"
      zIndex="1"
      pl={3}
      position="sticky"
      top="0"
      borderBottomWidth="1px"
      borderBottomColor={scheme.border}
    >
      <Tooltip
        label={isRecording ? 'Stop recording' : 'Start recording'}
        openDelay={500}
        placement="bottom-start"
      >
        <IconButton
          size="sm"
          onClick={onToggleRecording}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          mr={2}
          fill={isRecording ? 'red.500' : scheme.foreground}
          _hover={{ fill: isRecording ? 'red.300' : scheme.foreground }}
          icon={<CircleIcon />}
          variant="outline"
          borderColor={scheme.border}
        />
      </Tooltip>
      <Tooltip label="Clear messages" openDelay={500} placement="bottom-start">
        <IconButton
          size="sm"
          onClick={onClearMessage}
          fill={scheme.foreground}
          aria-label="Clear messages"
          icon={<ClearIcon />}
          variant="outline"
          borderColor={scheme.border}
        />
      </Tooltip>
      <Box width="1px" height="25px" backgroundColor={scheme.border} mx={2} />
      <Input
        size="sm"
        variant="outline"
        value={filterString}
        placeholder="Filter messages"
        onChange={onFilterStringChange}
        backgroundColor={scheme.background}
        borderColor={scheme.border}
        type="search"
        width="250px"
        borderRadius="8px"
      />
      <Box width="1px" height="25px" backgroundColor={scheme.border} mx={2} />
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
  );
};
