import type { PrismTheme } from 'prism-react-renderer';
import { useMemo } from 'react';
import { useColorScheme } from '../../hooks/useColorScheme';

export const useCodeTheme = (): PrismTheme => {
  const scheme = useColorScheme();
  return useMemo(
    () => ({
      plain: {
        backgroundColor: 'var(--background-color)',
        color: 'var(--foreground-color)',
      },
      styles: [
        {
          types: ['comment', 'prolog', 'doctype', 'cdata', 'punctuation'],
          style: {
            color: 'var(--cm-bracket)',
          },
        },
        {
          types: ['namespace'],
          style: {
            opacity: 0.7,
          },
        },
        {
          types: ['tag', 'operator', 'number'],
          style: {
            color: 'var(--cm-operator)',
          },
        },
        {
          types: ['property', 'function'],
          style: {
            color: 'var(--property-color)',
          },
        },
        {
          types: ['tag-id', 'selector', 'atrule-id'],
          style: {
            color: 'var(--cm-tag)',
          },
        },
        {
          types: ['attr-name'],
          style: {
            color: 'var(--attribute-color)',
          },
        },
        {
          types: [
            'boolean',
            'string',
            'entity',
            'url',
            'attr-value',
            'keyword',
            'control',
            'directive',
            'unit',
            'statement',
            'regex',
            'at-rule',
            'placeholder',
            'variable',
          ],
          style: {
            color: 'var(--keyword-color)',
          },
        },
        {
          types: ['deleted'],
          style: {
            textDecorationLine: 'line-through',
          },
        },
        {
          types: ['inserted'],
          style: {
            textDecorationLine: 'underline',
          },
        },
        {
          types: ['italic'],
          style: {
            fontStyle: 'italic',
          },
        },
        {
          types: ['important', 'bold'],
          style: {
            fontWeight: 'bold',
          },
        },
        {
          types: ['important'],
          style: {
            color: 'var(--variable-color)',
          },
        },
      ],
    }),
    [scheme],
  );
};
