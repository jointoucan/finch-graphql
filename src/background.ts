import browser from 'webextension-polyfill';
import { graphql, GraphQLSchema, Source } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  TanagerApiOptions,
  GenericVariables,
  TanagerMessage,
  TanagerMessageKey,
  TanagerContext,
  TanagerMessageSource,
  TanagerContextObj,
} from './types';

export class TanagerApi {
  schema: GraphQLSchema;
  context: TanagerContext;
  constructor({ context, attachMessages, attachExternalMessages, ...options }: TanagerApiOptions) {
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

  private getContext(baseContext: TanagerContextObj = {}) {
    return typeof this.context === 'function'
    ? this.context(baseContext)
    : { source: TanagerMessageSource.Internal, ...baseContext, ...this.context };
  }

  async query<T extends {}, V extends GenericVariables>(
    query: string | Source,
    variables?: V,
    baseContext?: TanagerContextObj,
  ) {
    const context = this.getContext(baseContext);
    return graphql(this.schema, query, { root: true }, context, variables);
  }

  onMessage(message: TanagerMessage) {
    if (message.type === TanagerMessageKey.Generic && message.query) {
      const { variables, query } = message;
      return this.query(query, variables ?? {}, { source: TanagerMessageSource.Message });
    }
  }

  onExternalMessage(message: TanagerMessage) {
    if (message !== TanagerMessageKey.Generic || !message.query) {
      return;
    }
    const { variables, query } = message;
    return this.query(query, variables ?? {}, { source: TanagerMessageSource.ExternalMessage });
  }
}
