import gql from 'graphql-tag'

/**
 * @description These types come from `finch-graphql/src/background/FinchDevtools` added here for codegen
 **/
export default gql`
  type FinchMessage {
    operationName: String
    rawQuery: String!
    variables: String
    initializedAt: Float!
    timeTaken: Float!
    response: String!
    context: String!
  }

  type FinchDevtools {
    enabled: Boolean!
    messages: [FinchMessage!]!
  }

  extend type Query {
    _finchDevtools: FinchDevtools
  }

  extend type Mutation {
    _enableFinchDevtools(enabled: Boolean!): Boolean!
  }
`
