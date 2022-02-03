import React, { useRef, useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Heading,
  AccordionIcon,
  Tag,
} from '@chakra-ui/react';
import { useAtom } from 'jotai';
import { MessageContent } from './MessageContent';
import { MessagesSidebar } from './MessageSidebar';
import { MessagesFilterBar } from './MessagesFilterBar';
import { useLocalStorage } from '../../hooks/useLocalStorage';

import { useColorScheme } from '../../hooks/useColorScheme';
import { MessageTimeline } from './MessageTimeline';
import { MessageTimelineMeta } from './MessageTimeline/types';
import { clearMessagesAtom, messagesAtom } from '../../atoms/messages';
import { isRecordingAtom, recordingAtAtom } from '../../atoms/devtool';

interface MessageViewerProps {
  extensionId: string;
}

export const MessagesViewer: React.FC<MessageViewerProps> = ({}) => {
  const [startedRecordingAt, setRecordingAt] = useAtom(recordingAtAtom);
  const ref = useRef<MessageTimelineMeta>({
    startedRecordingAt,
    currentTime: null,
  });
  const [messages] = useAtom(messagesAtom);
  const [isRecording] = useAtom(isRecordingAtom);
  const [, clearMessages] = useAtom(clearMessagesAtom);
  const scheme = useColorScheme();
  const [currentTabFilter, setCurrentTabFilter] = useLocalStorage(
    'messages:currentTabFilter',
    false,
  );
  const [filterString, setFilterString] = useLocalStorage(
    'messages:filterString',
    '',
  );
  const [selectedQuery, selectQuery] = useState(null);
  const [currentTabId] = useState(() => browser.devtools.inspectedWindow.tabId);

  const selectedQueryMessage = messages.find(({ id }) => selectedQuery === id);

  const filteredMessages = messages
    .filter(({ context }) => {
      if (
        currentTabFilter &&
        context.sender &&
        context.sender.tab &&
        context.sender.tab.id === currentTabId
      ) {
        return true;
      } else if (!currentTabFilter) {
        return true;
      }
      return false;
    })
    .filter(({ operationName }) => {
      if (filterString) {
        if (operationName && operationName.includes(filterString)) {
          return true;
        }
        return false;
      }
      return true;
    });

  if (startedRecordingAt) {
    ref.current.startedRecordingAt = startedRecordingAt;
  }

  return (
    <Box
      display="flex"
      height="100%"
      flexDirection="column"
      color={scheme.foreground}
      backgroundColor={scheme.background}
    >
      <MessagesFilterBar
        onClearMessage={clearMessages}
        currentTabOnly={currentTabFilter}
        onToggleCurrentTabFilter={() => {
          setCurrentTabFilter(!currentTabFilter);
        }}
        filterString={filterString}
        onFilterStringChange={e => {
          setFilterString(e.currentTarget.value);
        }}
        isRecording={isRecording}
        onToggleRecording={() => setRecordingAt(isRecording ? 0 : Date.now())}
      />
      <Box display="flex" flex="1" backgroundColor={scheme.background}>
        <MessagesSidebar
          messages={filteredMessages}
          selectedQuery={selectedQuery}
          selectQuery={selectQuery}
        />
        <Box
          backgroundColor={scheme.backgroundSecondary}
          pr={0.2}
          flex={0}
          zIndex={2}
        />
        <Box display="flex" flexDirection="column" width="70vw">
          <Accordion allowToggle>
            <AccordionItem>
              {({ isExpanded }) => (
                <>
                  <AccordionButton>
                    <Heading size="sm">
                      Timeline
                      <Tag
                        size="sm"
                        backgroundColor="teal.600"
                        ml={2}
                        color="grey.600"
                      >
                        BETA
                      </Tag>
                    </Heading>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel p={0}>
                    {isExpanded && (
                      <MessageTimeline
                        activeMessageId={selectedQueryMessage?.id}
                        isRecording={isRecording}
                        messages={filteredMessages}
                        startedRecordingAt={startedRecordingAt}
                        selectQuery={selectQuery}
                      />
                    )}
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>
          </Accordion>
          <MessageContent
            message={selectedQueryMessage}
            isRecording={isRecording}
          />
        </Box>
      </Box>
    </Box>
  );
};
