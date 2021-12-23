import React, { useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Tag,
  Tooltip,
  IconButton,
  useTabsContext,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tabs,
} from '@chakra-ui/react';
import { Code } from '../Code';
import { formatJSON, getMessageTagInfo } from './helpers';
import { print } from 'graphql';
import { FinchDevtoolsMessage } from './types';
import { CircleIcon, LinkOutIcon } from '../Icons';
import { useColorScheme } from '../../hooks/useColorScheme';
import { StorageKey } from '../../constants';

export const MessageContent: React.FC<{
  message: FinchDevtoolsMessage;
  isRecording: boolean;
}> = ({ message, isRecording }) => {
  const tag = message ? getMessageTagInfo(message) : { label: '', color: '  ' };
  const scheme = useColorScheme();
  const { setSelectedIndex: setSelectedTab } = useTabsContext();
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      maxWidth="70vw"
      overflow="scroll"
      // includes height of header
      maxHeight="calc(100vh - 91px)"
    >
      {message ? (
        <Tabs
          colorScheme="blue"
          onChange={index => setTabIndex(index)}
          defaultIndex={tabIndex}
          display="flex"
          flexDirection="column"
          height="100%"
          isLazy
        >
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

            <TabList
              position="sticky"
              top="0"
              backgroundColor={scheme.background}
              color={scheme.foreground}
            >
              <Tab>Query</Tab>
              <Tab>Variables</Tab>
              <Tab>Response</Tab>
              <Tab>Context</Tab>
            </TabList>
            <TabPanels flex="1" display="flex" flexDirection="column">
              <TabPanel p="0">
                <Code language="graphql" code={print(message.query)} />
              </TabPanel>
              <TabPanel p="0">
                <Code language="json" code={formatJSON(message.variables)} />
              </TabPanel>
              <TabPanel p="0">
                {message.response ? (
                  <Code language="json" code={formatJSON(message.response)} />
                ) : (
                  <Text>Request is still pending.</Text>
                )}
              </TabPanel>
              <TabPanel p="0">
                <Code language="json" code={formatJSON(message.context)} />
              </TabPanel>
            </TabPanels>
          </Box>
        </Tabs>
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
