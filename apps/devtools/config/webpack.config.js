const { paths } = require('./paths')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const webpack = require('webpack')
// const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
const { BrowserExtensionPlugin } = require('webpack-browser-extension-plugin')
const WebpackBar = require('webpackbar')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

const readFile = promisify(fs.readFile)

/**
 * create webpack config to build extension.
 * @returns {Object} a webpack configuration
 */
const createConfig = async () => {
  const isBuild = process.env.NODE_ENV === 'production'
  const isWatch = !isBuild
  const mode = isBuild ? 'production' : 'development'

  const manifest = JSON.parse(await readFile(paths.manifest, 'utf8'))

  return {
    mode,
    /**
     * The entry points of the bundle, there are three entry points:
     * - background: the background script bundle
     * - devtools: the devtools script bundle
     * - devtoolsPanel: the devtools panel script bundle
     */
    entry: {
      background: paths.background,
      devtools: paths.devtools,
      devtoolsPanel: paths.devtoolsPanel,
    },
    /**
     * The output of the bundle.
     * defaults to `dist/`
     */
    output: {
      path: paths.outputDirectory,
      filename: '[name].js',
      chunkFilename: '[id].chunk.js',
    },
    /**
     * Which extensions to resolve, currently supports typescript.
     */
    resolve: {
      extensions: ['.js', '.json', '.mjs', '.jsx', '.ts', '.tsx'],
    },
    /**
     * Only add inline source maps when in development.
     */
    devtool: isWatch ? 'inline-source-map' : false,
    /**
     * Remove node built-ins
     */
    node: false,
    /**
     * some reporting and optimization options
     */
    optimization: { minimize: isBuild },
    performance: false,
    /**
     * Add the webextension polyfill to the bundle.
     */
    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader' },
        {
          test: /webextension-polyfill[\\/]+dist[\\/]+browser-polyfill\.js$/,
          loader: require.resolve('string-replace-loader'),
          options: {
            search: 'typeof browser === "undefined"',
            replace:
              'typeof this.browser === "undefined" || Object.getPrototypeOf(this.browser) !== Object.prototype',
          },
        },
      ],
    },
    /**
     * Copy over assets to the extension build. Ignores all json, and typescript files
     */
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            context: paths.appRoot,
            from: path.resolve(paths.appRoot, '**/*').replace(/\\/g, '/'),
            globOptions: {
              ignore: ['**/*.ts', '**/*.tsx', '**/*.json', '**/*.graphql'],
            },
            to: paths.outputDirectory,
          },
        ],
      }),
      /**
       * Add the version to the environment
       */
      new webpack.EnvironmentPlugin({
        VERSION: manifest.version,
      }),
      /**
       * clean out the existing output directory, currently disabled due to bug in
       * BrowserExtensionPlugin. See https://github.com/jcblw/webpack-browser-extension-plugin/issues/6
       */
      // new CleanWebpackPlugin(),
      /** passing the webextension polyfill to the window */
      new webpack.ProvidePlugin({
        browser: paths.browserPolyfill,
      }),
      new webpack.ProvidePlugin({
        global: paths.globalShim,
      }),
      /**
       * Hot reload and manifest builder
       */
      new BrowserExtensionPlugin({
        port: 9090, // Which port use to create the server
        host: 'localhost',
        autoReload: isWatch,
        vendor: 'chrome',
        quiet: false,
        backgroundEntry: 'background',
        ignoreEntries: ['devtools'],
        manifestFilePath: paths.manifest,
        localeDirectory: paths.localeDirectory,
      }),
      /**
       * in build mode zip the build
       */
      isWatch
        ? null
        : new ZipPlugin({
            path: paths.packageDirectory,
            filename: `finch-graphiql-devtools.v${manifest.version}.zip`,
          }),
      /**
       * Nice loader view for webpack in the terminal
       */
      new WebpackBar({
        name: `Finch GraphQL Devtools [${mode}]`,
      }),
      new FriendlyErrorsWebpackPlugin(),
      // Filter out all null values
    ].filter(x => x),
  }
}

module.exports = {
  createConfig,
}
