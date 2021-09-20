import { FinchApi } from 'finch-graphql';
import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';

new FinchApi({
  typeDefs: typeDefs,
  resolvers: resolvers,
  attachMessages: true,
  attachExternalMessages: true,
});
