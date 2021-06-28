import gql from 'graphql-tag'

export default gql`
  type Extension {
    name: String!
    version: String!
    id: String!
    icon: String!
    enabled: Boolean!
  }

  extend type Query {
    extensions: [Extension!]!
    extension(id: String!): Extension
    manifest: Extension!
  }

  extend type Mutation {
    requestManagementPermission: Boolean!
  }
`
