const { FinchApi } = require('finch-graphql')
const { resolvers } = require('./resolvers')
const { typeDefs } = require('./typeDefs')

new FinchApi({
  typeDefs: typeDefs,
  resolvers: resolvers,
  attachMessages: true,
  attachExternalMessages: true,
  onQueryResponse: ({ operationName }) => {
    console.log('Query response', operationName)
  },
})
