import React, { FC } from 'react';
import { Box } from '@chakra-ui/react';
import { useColorScheme } from '../../hooks/useColorScheme';
import Highlight, { defaultProps } from 'prism-react-renderer';
import { useCodeTheme } from './finchTheme';

interface CodeProps {
  code: string;
  language: 'json' | 'graphql';
}

export const Code: FC<CodeProps> = ({ code, language }) => {
  const scheme = useColorScheme();
  const theme = useCodeTheme();
  return (
    <Box as="pre" p={4} rounded={8} mb={3} overflow="scroll">
      <Box
        as="code"
        color={scheme.highlightSecondary}
        overflow="scroll"
        whiteSpace="break-spaces"
      >
        <Highlight
          {...defaultProps}
          theme={theme}
          code={code}
          language={language}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={className} style={style}>
              {tokens.map((line, i) => (
                <div {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </Box>
    </Box>
  );
};
