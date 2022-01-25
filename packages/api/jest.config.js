module.exports = {
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['jest-webextension-mock', '<rootDir>/src/setupJest.ts'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
};
