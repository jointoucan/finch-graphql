import { DocumentNode, print } from 'graphql';
import gql from 'graphql-tag';
import { FinchContextObj } from '../types';

interface MessageMeta {
  query: DocumentNode;
  operationName: string | undefined;
  context: FinchContextObj;
  timeTaken: number;
  response: any;
  variables: any;
}

interface MessageCache {
  operationName: String;
  rawQuery: string;
  variables: string;
  initializedAt: number;
  timeTaken: number;
  response: string;
  context: string;
}

let requests: Array<MessageCache> = [];
let enabled: boolean = false;

export const finchDevtoolsOnResponse = async ({
  query,
  operationName,
  timeTaken,
  response,
  variables,
  context,
}: MessageMeta) => {
  if (
    enabled &&
    operationName !== 'getMessages' &&
    operationName !== 'enableMessages'
  ) {
    requests.push({
      rawQuery: print(query),
      operationName: operationName ?? 'unknown',
      timeTaken,
      initializedAt: Date.now() - timeTaken,
      response: JSON.stringify(response),
      variables: JSON.stringify(variables),
      context: JSON.stringify(context),
    });
  }
};

export const finchDevtoolsResolvers = {
  Query: {
    _finchDevtools: () => {
      const currentRequests = [...requests];
      requests = [];
      return {
        enabled,
        messages: currentRequests,
      };
    },
  },
  Mutation: {
    _enableFinchDevtools: () => {
      enabled = true;
      return true;
    },
  },
};

export const finchDevtoolsSchema = gql`
  type FinchMessage {
    operationName: String
    rawQuery: String!
    variables: String
    initializedAt: Float!
    timeTaken: Float!
    response: String!
    context: String!
  }

  type FinchDevtools {
    enabled: Boolean!
    messages: [FinchMessage!]!
  }

  extend type Query {
    _finchDevtools: FinchDevtools
  }

  extend type Mutation {
    _enableFinchDevtools(enabled: Boolean!): Boolean!
  }
`;
