import gql from 'graphql-tag';
import browserSchema from './schemas/browser';

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
`;

export const typeDefs = [initialSchema, browserSchema];
