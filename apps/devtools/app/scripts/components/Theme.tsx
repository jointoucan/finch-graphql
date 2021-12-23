import { FC } from 'react';
import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import { theme } from '../styles/theme';
import { useEffect } from 'react';
import { colorScheme } from '../styles/colorScheme';
import { getColor } from '@chakra-ui/theme-tools';

const createCSSVar = (root: HTMLElement, name: string, value: string) => {
  root.style.setProperty(name, getColor(theme, value, 'tomato'));
};

export const CSSColorModeVar: FC = () => {
  const { colorMode } = useColorMode();
  useEffect(() => {
    const root = document.documentElement;
    const createVar = createCSSVar.bind(null, root);

    createVar('--foreground-color', colorScheme[colorMode].foreground);
    createVar(
      '--foreground-secondary-color',
      colorScheme[colorMode].foregroundSecondary,
    );
    createVar('--background-color', colorScheme[colorMode].background);
    createVar(
      '--background-secondary-color',
      colorScheme[colorMode].backgroundSecondary,
    );
    createVar('--border-color', colorScheme[colorMode].border);
    createVar('--highlight-color', colorScheme[colorMode].highlight);
    createVar('--highlight-color', colorScheme[colorMode].highlightSecondary);

    // Editor
    createVar('--keyword-color', colorScheme[colorMode].keyword);
    createVar('--definition-color', colorScheme[colorMode].definition);
    createVar('--punctuation-color', colorScheme[colorMode].punctuation);
    createVar('--str-color', colorScheme[colorMode].str);
    createVar('--builtin-color', colorScheme[colorMode].builtin);
    createVar('--punctuation-color', colorScheme[colorMode].punctuation);
    createVar('--property-color', colorScheme[colorMode].property);
    createVar('--variable-color', colorScheme[colorMode].variable);
    createVar('--atom-color', colorScheme[colorMode].atom);
    createVar('--attribute-color', colorScheme[colorMode].attribute);
    createVar('--number-color', colorScheme[colorMode].number);
    createVar(
      '--matching-bracket-color',
      colorScheme[colorMode].matchingBracket,
    );
    createVar('--invalid-char-color', colorScheme[colorMode].invalidChar);
    createVar('--comment-color', colorScheme[colorMode].comment);
  }, [colorMode]);

  return null;
};

export const Theme: FC = ({ children }) => {
  return (
    <ChakraProvider theme={theme}>
      <CSSColorModeVar />
      {children}
    </ChakraProvider>
  );
};
