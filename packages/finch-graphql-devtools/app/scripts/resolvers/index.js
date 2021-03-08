import { extensionResolvers } from './extensions'

export const resolvers = {
  Query: {
    ...extensionResolvers.Query,
  },
  Mutation: {
    ...extensionResolvers.Mutation,
  },
}
