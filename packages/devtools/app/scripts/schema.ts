import gql from 'graphql-tag';
import { useQuery, useMutation } from '@finch-graphql/react';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Browser = {
  __typename?: 'Browser';
  extensions: Array<Extension>;
  extension?: Maybe<Extension>;
  manifest: Extension;
  permission?: Maybe<Scalars['Boolean']>;
};

export type BrowserExtensionArgs = {
  id: Scalars['String'];
};

export type BrowserPermissionArgs = {
  permission: PermissionInput;
};

export type Extension = {
  __typename?: 'Extension';
  name: Scalars['String'];
  version: Scalars['String'];
  id: Scalars['String'];
  icon: Scalars['String'];
  enabled: Scalars['Boolean'];
};

export type Mutation = {
  __typename?: 'Mutation';
  requestManagementPermission: Scalars['Boolean'];
};

export type PermissionInput = {
  origins?: Maybe<Array<Scalars['String']>>;
  permissions?: Maybe<Array<Scalars['String']>>;
};

export type Query = {
  __typename?: 'Query';
  browser?: Maybe<Browser>;
};

export type GetExtensionsQueryVariables = Exact<{ [key: string]: never }>;

export type GetExtensionsQuery = { __typename?: 'Query' } & {
  browser?: Maybe<
    { __typename?: 'Browser' } & {
      extensions: Array<
        { __typename?: 'Extension' } & Pick<
          Extension,
          'id' | 'name' | 'version' | 'icon' | 'enabled'
        >
      >;
      manifest: { __typename?: 'Extension' } & Pick<
        Extension,
        'id' | 'name' | 'version'
      >;
    }
  >;
};

export type GetExtensionQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type GetExtensionQuery = { __typename?: 'Query' } & {
  browser?: Maybe<
    { __typename?: 'Browser' } & Pick<Browser, 'permission'> & {
        extension?: Maybe<
          { __typename?: 'Extension' } & Pick<
            Extension,
            'id' | 'name' | 'version' | 'icon' | 'enabled'
          >
        >;
      }
  >;
};

export type RequestManagementPermissionMutationVariables = Exact<{
  [key: string]: never;
}>;

export type RequestManagementPermissionMutation = {
  __typename?: 'Mutation';
} & Pick<Mutation, 'requestManagementPermission'>;

export const GetExtensions = gql`
  query getExtensions {
    browser {
      extensions {
        id
        name
        version
        icon
        enabled
      }
      manifest {
        id
        name
        version
      }
    }
  }
`;
export const GetExtension = gql`
  query getExtension($id: String!) {
    browser {
      extension(id: $id) {
        id
        name
        version
        icon
        enabled
      }
      permission(permission: { permissions: ["management"] })
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
    browser {
      extensions {
        id
        name
        version
        icon
        enabled
      }
      manifest {
        id
        name
        version
      }
    }
  }
`;
export const useGetExtensionsQuery = (config?: {
  variables?: GetExtensionsQueryVariables;
  skip?: Boolean;
}) =>
  useQuery<GetExtensionsQuery, GetExtensionsQueryVariables>(
    GetExtensionsDocument,
    config,
  );
export const GetExtensionDocument = gql`
  query getExtension($id: String!) {
    browser {
      extension(id: $id) {
        id
        name
        version
        icon
        enabled
      }
      permission(permission: { permissions: ["management"] })
    }
  }
`;
export const useGetExtensionQuery = (config?: {
  variables?: GetExtensionQueryVariables;
  skip?: Boolean;
}) =>
  useQuery<GetExtensionQuery, GetExtensionQueryVariables>(
    GetExtensionDocument,
    config,
  );
export const RequestManagementPermissionDocument = gql`
  mutation requestManagementPermission {
    requestManagementPermission
  }
`;
export const useRequestManagementPermissionMutation = () =>
  useMutation<
    RequestManagementPermissionMutation,
    RequestManagementPermissionMutationVariables
  >(RequestManagementPermissionDocument);
