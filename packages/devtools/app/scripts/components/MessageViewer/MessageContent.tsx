import React from 'react';
import {
  Box,
  Text,
  Heading,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  Tag,
  useAccordionContext,
  Tooltip,
  IconButton,
  useTabsContext,
} from '@chakra-ui/react';
import { Code } from '../Code';
import { formatJSON, getMessageTagInfo } from './helpers';
import { print } from 'graphql';
import { FinchDevtoolsMessage } from './types';
import { CircleIcon, LinkOutIcon } from '../Icons';
import { useColorScheme } from '../../hooks/useColorScheme';
import { StorageKey } from '../../constants';

interface MessageAccordionItem {
  title: string;
  index: number;
}

export const MessageAccordionItem: React.FC<MessageAccordionItem> = ({
  children,
  title,
  index,
}) => {
  const { index: selectedIndex } = useAccordionContext();
  const isOpen = index === selectedIndex;
  const scheme = useColorScheme();

  return (
    <AccordionItem
      display="flex"
      flex={isOpen ? '1' : ''}
      flexDirection="column"
      overflow={isOpen ? 'scroll' : 'hidden'}
      borderColor={scheme.border}
    >
      <Heading size="sm" flex="0">
        <AccordionButton>
          <Box flex="1" textAlign="left">
            {title}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </Heading>
      <Box
        display={isOpen ? 'flex' : 'none'}
        flexDirection="column"
        backgroundColor={scheme.background}
        flex="1"
        flexBasis="1px"
        overflow="scroll"
      >
        {children}
      </Box>
    </AccordionItem>
  );
};

export const MessageContent: React.FC<{
  message: FinchDevtoolsMessage;
  isRecording: boolean;
}> = ({ message, isRecording }) => {
  const tag = message ? getMessageTagInfo(message) : { label: '', color: '  ' };
  const scheme = useColorScheme();
  const { setSelectedIndex: setSelectedTab } = useTabsContext();

  return (
    <Box flex={1} display="flex" flexDirection="column" maxWidth="70vw">
      {message ? (
        <Box flex="1" display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column" pl={4} pt={6} pb={4}>
            <Box display="flex" flexDirection="row">
              <Box display="column" flex="1">
                <Box display="flex" alignItems="center" pb={2}>
                  <Tag backgroundColor={tag.color} mr={2} color="gray.600">
                    {tag.label}
                  </Tag>
                  <Heading size="md" flex="0">
                    {message.operationName}
                  </Heading>
                </Box>
                {message.timeTaken && (
                  <Text pb={1}>
                    <strong>Time taken:</strong> {message.timeTaken}ms
                  </Text>
                )}
                <Text>
                  <strong>Started at:</strong>{' '}
                  {new Date(message.initializedAt).toISOString()}
                </Text>
              </Box>
              <Box pr={4}>
                <Tooltip label="Open in GraphiQL" openDelay={500}>
                  <IconButton
                    onClick={() => {
                      localStorage.setItem(
                        StorageKey.GraphiQLQuery,
                        print(message.query),
                      );
                      localStorage.setItem(
                        StorageKey.GraphiQLVariables,
                        JSON.stringify(message.variables, null, ' '),
                      );
                      // set local storage
                      // open graphiql tab
                      setSelectedTab(0);
                    }}
                    size="sm"
                    aria-label="Open in GraphiQL"
                    icon={<LinkOutIcon />}
                    variant="outline"
                    borderColor={scheme.border}
                    fill={scheme.foreground}
                  />
                </Tooltip>
              </Box>
            </Box>
          </Box>
          <Accordion allowToggle flex="1" display="flex" flexDirection="column">
            <MessageAccordionItem title="Query" index={0}>
              <Code code={print(message.query)} />
            </MessageAccordionItem>
            <MessageAccordionItem title="Variables" index={1}>
              <Code code={formatJSON(message.variables)} />
            </MessageAccordionItem>

            <MessageAccordionItem title="Response" index={2}>
              {message.response ? (
                <Code code={formatJSON(message.response)} />
              ) : (
                <Text>Request is still pending.</Text>
              )}
            </MessageAccordionItem>
            <MessageAccordionItem title="Context" index={3}>
              <Code code={formatJSON(message.context)} />
            </MessageAccordionItem>
          </Accordion>
        </Box>
      ) : (
        <Box
          flex="1"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Text textAlign="center" fontWeight="700">
            {isRecording ? (
              'Select a message in the sidebar'
            ) : (
              <Box
                as="span"
                display="inline-flex"
                flexDirection="row"
                alignItems="center"
              >
                Click the <CircleIcon fill={scheme.foreground} mx={1} /> to
                start recording
              </Box>
            )}
          </Text>
        </Box>
      )}
    </Box>
  );
};
