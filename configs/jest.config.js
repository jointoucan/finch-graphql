module.exports = {
  roots: ['<rootDir>/src'],
  setupFiles: ['jest-webextension-mock'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
};
