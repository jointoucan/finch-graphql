const path = require('path')

const rootDir = path.resolve(__dirname, '../')

const resolveRoot = (...paths) => {
  return path.resolve(rootDir, ...paths)
}

const resolveApp = filePath => {
  return resolveRoot(rootDir, './app', filePath)
}

const paths = {
  appRoot: resolveApp('.'),
  outputDirectory: resolveRoot('./build'),
  packageDirectory: resolveRoot('./dist'),
  background: resolveApp('./scripts/background.ts'),
  devtools: resolveApp('./scripts/devtools.ts'),
  devtoolsPanel: resolveApp('./scripts/devtoolsPanel.tsx'),
  manifest: resolveApp('./manifest.json'),
  localeDirectory: resolveApp('./_locales'),
  globalShim: resolveRoot('./scripts/global.js'),
  browserPolyfill: require.resolve('webextension-polyfill'),
}

module.exports = { paths }
