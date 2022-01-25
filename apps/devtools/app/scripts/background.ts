import { FinchApi } from '@finch-graphql/api';
import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';

new FinchApi({
  typeDefs: typeDefs,
  resolvers: resolvers,
  disableDevtools: true,
});
