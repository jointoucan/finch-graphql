const { createConfig } = require('../config/webpack.config')
const webpack = require('webpack')

;(async () => {
  process.env.NODE_ENV = 'production'
  const config = await createConfig()
  const compiler = webpack(config)
  await compiler.run()
})()
