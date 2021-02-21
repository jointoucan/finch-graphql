const extensions = ['.ts', '.js', '.jsx', '.tsx', '.json'];

module.exports = {
  extends: ['prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  env: {
    es6: true,
    browser: true,
    jest: true,
  },
  rules: {
    // Remove till we can cleanup deps to avoid old versions of typescript lint from being used.
    'no-use-before-define': 'off',
    // Typescripts overrides
    'no-shadow': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-unused-expressions': ['error'],

    'prettier/prettier': ['error'],
    'no-plusplus': [
      'error',
      {
        allowForLoopAfterthoughts: true,
      },
    ],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    'no-underscore-dangle': ['error', { allow: ['__typename'] }],
    'import/prefer-default-export': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.ts'] },
    ],
  },
  settings: {
    'import/extensions': extensions,
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions,
      },
      alias: {
        extensions,
      },
    },
  },
};
