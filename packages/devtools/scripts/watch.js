const { createConfig } = require('../config/webpack.config')
const webpack = require('webpack')

;(async () => {
  process.env.NODE_ENV = 'development'
  const config = await createConfig()
  const compiler = webpack(config)
  compiler.watch({ ignored: /node_modules/ }, async err => {
    if (err) {
      console.error(err)
    }
    console.log('Webpack compiled successfully')
  })
})()
