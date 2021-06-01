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
import { formatJSON } from './helpers'

export const MessageAccordionItem = ({ children, title, index }) => {
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

export const MessageContent = ({ message }) => {
  const hasErrors =
    message && message.response.errors && message.response.errors.length
  return (
    <Box flex={1} display="flex" flexDirection="column">
      {message && (
        <Box flex="1" display="flex" flexDirection="column">
          <Box display="flex" flexDirection="column" pl={4} pt={6} pb={4}>
            <Box display="flex" alignItems="center" pb={2}>
              <Tag backgroundColor={hasErrors ? 'red.200' : 'teal.200'} mr={2}>
                {hasErrors ? 'ERROR' : 'OK'}
              </Tag>
              <Heading size="md" flex="0">
                {message.operationName}
              </Heading>
            </Box>
            <Text pb={1}>
              <strong>Time taken:</strong> {message.timeTaken}ms
            </Text>
            <Text>
              <strong>Started at:</strong>{' '}
              {new Date(message.initializedAt).toISOString()}
            </Text>
          </Box>
          <Accordion allowToggle flex="1" display="flex" flexDirection="column">
            <MessageAccordionItem title="Query" index={0}>
              <Code code={message.rawQuery} mode="graphql" />
            </MessageAccordionItem>
            <MessageAccordionItem title="Variables" index={1}>
              <Code code={formatJSON(message.variables)} mode="javascript" />
            </MessageAccordionItem>

            <MessageAccordionItem title="Response" index={2}>
              <Code code={formatJSON(message.response)} mode="javascript" />
            </MessageAccordionItem>
            <MessageAccordionItem title="Context" index={3}>
              <Code code={formatJSON(message.context)} mode="javascript" />
            </MessageAccordionItem>
          </Accordion>
        </Box>
      )}
    </Box>
  )
}
