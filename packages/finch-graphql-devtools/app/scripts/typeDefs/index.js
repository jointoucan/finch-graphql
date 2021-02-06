import gql from 'graphql-tag'
import { extensionsSchema } from './extensions'

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
