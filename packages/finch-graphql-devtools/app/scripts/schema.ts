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

export type Mutation = {
  __typename?: 'Mutation';
  requestManagementPermission: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
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