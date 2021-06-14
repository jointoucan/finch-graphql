import React from 'react'
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
} from '@chakra-ui/react'
import { Code } from '../Code'
import { formatJSON, getMessageTagInfo } from './helpers'
import { print } from 'graphql'
import { FinchDevtoolsMessage } from './types'

interface MessageAccordionItem {
  title: string
  index: number
}

export const MessageAccordionItem: React.FC<MessageAccordionItem> = ({
  children,
  title,
  index,
}) => {
  const { index: selectedIndex } = useAccordionContext()
  const isOpen = index === selectedIndex

  return (
    <AccordionItem
      display="flex"
      flex={isOpen ? '1' : ''}
      flexDirection="column"
      overflow={isOpen ? 'scroll' : 'hidden'}
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
        backgroundColor="white"
        flex="1"
        flexBasis="1px"
        overflow="scroll"
      >
        {children}
      </Box>
    </AccordionItem>
  )
}

export const MessageContent: React.FC<{ message: FinchDevtoolsMessage }> = ({
  message,
}) => {
  const tag = message ? getMessageTagInfo(message) : { label: '', color: '  ' }
  return (
    <Box flex={1} display="flex" flexDirection="column" maxWidth="70vw">
      {message ? (
        <Box flex="1" display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column" pl={4} pt={6} pb={4}>
            <Box display="flex" alignItems="center" pb={2}>
              <Tag backgroundColor={tag.color} mr={2}>
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
            Select a message in the sidebar
          </Text>
        </Box>
      )}
    </Box>
  )
}
