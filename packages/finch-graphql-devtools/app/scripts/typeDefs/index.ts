import gql from 'graphql-tag'
import extensionsSchema from './schemas/extensions'

export const initialSchema = gql`
  schema {
    query: Query
    mutation: Mutation
  }
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
`

export const typeDefs = [initialSchema, extensionsSchema]
