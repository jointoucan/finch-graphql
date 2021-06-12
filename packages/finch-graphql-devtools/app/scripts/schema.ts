import gql from 'graphql-tag';
import { useQuery, useMutation } from 'finch-graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Extension = {
  __typename?: 'Extension';
  name: Scalars['String'];
  version: Scalars['String'];
  id: Scalars['String'];
  icon: Scalars['String'];
};

export type FinchDevtools = {
  __typename?: 'FinchDevtools';
  enabled: Scalars['Boolean'];
  messages: Array<FinchMessage>;
};

export type FinchMessage = {
  __typename?: 'FinchMessage';
  operationName?: Maybe<Scalars['String']>;
  rawQuery: Scalars['String'];
  variables?: Maybe<Scalars['String']>;
  initializedAt: Scalars['Float'];
  timeTaken: Scalars['Float'];
  response: Scalars['String'];
  context: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  _enableFinchDevtools: Scalars['Boolean'];
  requestManagementPermission: Scalars['Boolean'];
};


export type Mutation_EnableFinchDevtoolsArgs = {
  enabled: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  _finchDevtools?: Maybe<FinchDevtools>;
  extensions: Array<Extension>;
  manifest: Extension;
};

export type GetExtensionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetExtensionsQuery = (
  { __typename?: 'Query' }
  & { extensions: Array<(
    { __typename?: 'Extension' }
    & Pick<Extension, 'id' | 'name' | 'version' | 'icon'>
  )>, manifest: (
    { __typename?: 'Extension' }
    & Pick<Extension, 'id' | 'name' | 'version'>
  ) }
);

export type RequestManagementPermissionMutationVariables = Exact<{ [key: string]: never; }>;


export type RequestManagementPermissionMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'requestManagementPermission'>
);

export type GetMessagesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMessagesQuery = (
  { __typename?: 'Query' }
  & { _finchDevtools?: Maybe<(
    { __typename?: 'FinchDevtools' }
    & Pick<FinchDevtools, 'enabled'>
    & { messages: Array<(
      { __typename?: 'FinchMessage' }
      & Pick<FinchMessage, 'operationName' | 'rawQuery' | 'variables' | 'initializedAt' | 'timeTaken' | 'response' | 'context'>
    )> }
  )> }
);

export type EnableMessagesMutationVariables = Exact<{ [key: string]: never; }>;


export type EnableMessagesMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, '_enableFinchDevtools'>
);


export const GetExtensions = gql`
    query getExtensions {
  extensions {
    id
    name
    version
    icon
  }
  manifest {
    id
    name
    version
  }
}
    `;
export const RequestManagementPermission = gql`
    mutation requestManagementPermission {
  requestManagementPermission
}
    `;
export const GetMessages = gql`
    query getMessages {
  _finchDevtools {
    enabled
    messages {
      operationName
      rawQuery
      variables
      initializedAt
      timeTaken
      response
      context
    }
  }
}
    `;
export const EnableMessages = gql`
    mutation enableMessages {
  _enableFinchDevtools(enabled: true)
}
    `;

export const GetExtensionsDocument = gql`
    query getExtensions {
  extensions {
    id
    name
    version
    icon
  }
  manifest {
    id
    name
    version
  }
}
    `;
export const useGetExtensionsQuery = (config?: {
        variables?: GetExtensionsQueryVariables;
        skip?: Boolean;
      }) => useQuery<GetExtensionsQuery, GetExtensionsQueryVariables>(GetExtensionsDocument, config);
export const RequestManagementPermissionDocument = gql`
    mutation requestManagementPermission {
  requestManagementPermission
}
    `;
export const useRequestManagementPermissionMutation = () => useMutation<RequestManagementPermissionMutation, RequestManagementPermissionMutationVariables>(RequestManagementPermissionDocument);
export const GetMessagesDocument = gql`
    query getMessages {
  _finchDevtools {
    enabled
    messages {
      operationName
      rawQuery
      variables
      initializedAt
      timeTaken
      response
      context
    }
  }
}
    `;
export const useGetMessagesQuery = (config?: {
        variables?: GetMessagesQueryVariables;
        skip?: Boolean;
      }) => useQuery<GetMessagesQuery, GetMessagesQueryVariables>(GetMessagesDocument, config);
export const EnableMessagesDocument = gql`
    mutation enableMessages {
  _enableFinchDevtools(enabled: true)
}
    `;
export const useEnableMessagesMutation = () => useMutation<EnableMessagesMutation, EnableMessagesMutationVariables>(EnableMessagesDocument);