import {
  Box,
  BoxProps,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { FinchConnectionType, FinchMessageKey } from '@finch-graphql/types';
import { FC } from 'react';
import { useColorScheme } from '../../hooks/useColorScheme';
import { CircleIcon } from '../Icons';
import { ConnectionInfo } from '../types';

interface CurrentExtensionProps {
  id: string;
  name: string;
  version: string;
  icon?: string;
  enabled: boolean;
  isConnected: boolean;
  connectionInfo?: ConnectionInfo;
}

const CurrentExtensionInfoItem: FC<
  { label: string; value: string } & BoxProps
> = ({ label, value, ...boxProps }) => (
  <Box mb={2} {...boxProps}>
    <Text>{label}</Text>
    <Heading
      size="sm"
      whiteSpace="nowrap"
      textOverflow="ellipsis"
      overflow="hidden"
      maxWidth="250px"
    >
      {value}
    </Heading>
  </Box>
);

export const CurrentExtension: FC<CurrentExtensionProps> = ({
  icon,
  name,
  version,
  isConnected,
  children,
  connectionInfo,
}) => {
  const scheme = useColorScheme();

  return (
    <Box position="sticky" top={0} zIndex={10}>
      <Box
        listStyleType="none"
        display="flex"
        alignItems="center"
        borderBottom={`1px solid`}
        borderBottomColor={scheme.border}
        px={2}
        py={1}
        backgroundColor={scheme.border}
        zIndex={10}
      >
        <Text>Current targeted extension</Text>
      </Box>
      <Box
        listStyleType="none"
        display="flex"
        alignItems="flex-start"
        borderBottom={`1px solid`}
        borderBottomColor={scheme.border}
        backgroundColor={scheme.background}
        p={4}
        zIndex={10}
      >
        <Box position="relative">
          <img src={icon} alt={`${name} icon`} width="36px" height="36px" />
          <CircleIcon
            fill={isConnected ? 'green.300' : scheme.border}
            position="absolute"
            bottom={-1}
            right={-1}
          />
        </Box>
        <Box pl={4} flex="1">
          <Heading
            size="sm"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            overflow="hidden"
            maxWidth="100%"
          >
            {name}
          </Heading>
          <Text>v{version}</Text>
          <Accordion allowToggle>
            <AccordionItem css={{ border: 'none' }}>
              <Text>
                <AccordionButton p={0} fontSize="sm" fontWeight="bold">
                  Connection Info
                  <AccordionIcon />
                </AccordionButton>
              </Text>
              <AccordionPanel pb={2} pl={0}>
                <>
                  <CurrentExtensionInfoItem
                    mt={2}
                    label="Connection Type"
                    value={connectionInfo?.connectionType ?? 'message'}
                  />
                  {connectionInfo?.connectionType !==
                  FinchConnectionType.Port ? (
                    <CurrentExtensionInfoItem
                      label="Message Key"
                      value={
                        connectionInfo?.messageKey ?? FinchMessageKey.Generic
                      }
                    />
                  ) : (
                    <CurrentExtensionInfoItem
                      label="Port Name"
                      value={connectionInfo?.messagePortName}
                    />
                  )}
                </>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
          <Box mb={2}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
};
