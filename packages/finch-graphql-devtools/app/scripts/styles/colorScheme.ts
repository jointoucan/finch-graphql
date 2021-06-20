export interface ColorScheme {
  foreground: string
  foregroundSecondary: string
  background: string
  backgroundSecondary: string
  highlight: string
  highlightSecondary: string
  border: string
  scheme: 'dark' | 'light'
  // Editor colors
  keyword: string
  definition: string
  punctuation: string
  str: string
  builtin: string
  property: string
  variable: string
  atom: string
  attribute: string
  number: string
  matchingBracket: string
  // Needs cursor, highlight colors
}

export const colorScheme: Record<'dark' | 'light', ColorScheme> = {
  dark: {
    foreground: 'gray.100',
    foregroundSecondary: 'gray.300',
    background: 'gray.900',
    backgroundSecondary: 'gray.700',
    highlight: 'blue.500',
    highlightSecondary: 'blue.300',
    border: 'gray.600',
    scheme: 'dark',
    // Editor
    keyword: 'blue.300',
    definition: 'yellow.200',
    punctuation: 'gray.100',
    str: 'teal.100',
    builtin: 'yellow.400',
    property: 'blue.200',
    variable: 'blue.300',
    atom: 'teal.300',
    attribute: 'yellow.200',
    number: 'purple.300',
    matchingBracket: 'teal.200',
  },
  light: {
    foreground: 'gray.600',
    foregroundSecondary: 'gray.500',
    background: 'white',
    backgroundSecondary: 'gray.100',
    highlight: 'blue.100',
    highlightSecondary: 'blue.300',
    border: 'gray.300',
    scheme: 'light',
    // Editor
    keyword: 'blue.400',
    definition: 'yellow.500',
    punctuation: 'blue.700',
    str: 'teal.500',
    builtin: 'yellow.400',
    property: 'blue.600',
    variable: 'blue.300',
    atom: 'green.500',
    attribute: 'yellow.600',
    number: 'purple.300',
    matchingBracket: 'teal.200',
  },
}
