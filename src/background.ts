import browser from 'webextension-polyfill';
import { graphql, GraphQLSchema, Source } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  BackgroundGraphQLOptions,
  GenericVariables,
  GraphQLMessage,
  GraphQLMessageKey,
  GraphQLContext,
  GraphQLMessageSource,
  GraphQLContextObj,
} from './types';

export class BackgroundGraphQL {
  schema: GraphQLSchema;
  context: GraphQLContext;
  constructor({ context, attachMessages, attachExternalMessages, ...options }: BackgroundGraphQLOptions) {
    this.schema = makeExecutableSchema(options);
    this.context = context ?? {};

    this.onMessage = this.onMessage.bind(this);
    this.onExternalMessage = this.onExternalMessage.bind(this);

    if (attachMessages) {
      browser.runtime.onMessage.addListener(this.onMessage);
    }
    if (attachExternalMessages) {
      browser.runtime.onMessageExternal.addListener(this.onExternalMessage);
    }
  }

  private getContext(baseContext: GraphQLContextObj = {}) {
    return typeof this.context === 'function'
    ? this.context(baseContext)
    : { source: GraphQLMessageSource.Internal, ...baseContext, ...this.context };
  }

  async query<T extends {}, V extends GenericVariables>(
    query: string | Source,
    variables?: V,
    baseContext?: GraphQLContextObj,
  ) {
    const context = this.getContext(baseContext);
    return graphql(this.schema, query, { root: true }, context, variables);
  }

  onMessage(message: GraphQLMessage) {
    if (message.type === GraphQLMessageKey.Generic && message.query) {
      const { variables, query } = message;
      return this.query(query, variables ?? {}, { source: GraphQLMessageSource.Message });
    }
  }

  onExternalMessage(message: GraphQLMessage) {
    if (message !== GraphQLMessageKey.Generic || !message.query) {
      return;
    }
    const { variables, query } = message;
    return this.query(query, variables ?? {}, { source: GraphQLMessageSource.ExternalMessage });
  }
}
