import gql from 'graphql-tag'

export default gql`
  type Extension {
    name: String!
    version: String!
    id: String!
    icon: String!
    enabled: Boolean!
  }

  input PermissionInput {
    origins: [String!]
    permissions: [String!]
  }

  type Browser {
    extensions: [Extension!]!
    extension(id: String!): Extension
    manifest: Extension!
    permission(permission: PermissionInput!): Boolean
  }

  extend type Query {
    browser: Browser
  }

  extend type Mutation {
    requestManagementPermission: Boolean!
  }
`
