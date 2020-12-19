import browser from 'webextension-polyfill';
import { graphql, GraphQLSchema, Source } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  TangerApiOptions,
  GenericVariables,
  TangerMessage,
  TangerMessageKey,
  TangerContext,
  TangerMessageSource,
  TangerContextObj,
} from './types';

export class TangerApi {
  schema: GraphQLSchema;
  context: TangerContext;
  constructor({ context, attachMessages, attachExternalMessages, ...options }: TangerApiOptions) {
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

  private getContext(baseContext: TangerContextObj = {}) {
    return typeof this.context === 'function'
    ? this.context(baseContext)
    : { source: TangerMessageSource.Internal, ...baseContext, ...this.context };
  }

  async query<T extends {}, V extends GenericVariables>(
    query: string | Source,
    variables?: V,
    baseContext?: TangerContextObj,
  ) {
    const context = this.getContext(baseContext);
    return graphql(this.schema, query, { root: true }, context, variables);
  }

  onMessage(message: TangerMessage) {
    if (message.type === TangerMessageKey.Generic && message.query) {
      const { variables, query } = message;
      return this.query(query, variables ?? {}, { source: TangerMessageSource.Message });
    }
  }

  onExternalMessage(message: TangerMessage) {
    if (message !== TangerMessageKey.Generic || !message.query) {
      return;
    }
    const { variables, query } = message;
    return this.query(query, variables ?? {}, { source: TangerMessageSource.ExternalMessage });
  }
}
