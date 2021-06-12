import { useMutation, useQuery } from 'finch-graphql'
import gql from 'graphql-tag'
import {
  useGetExtensionsQuery,
  useRequestManagementPermissionMutation,
} from '../schema'

export const useInstalledExtensions = () => {
  const { data, loading, error, refetch } = useGetExtensionsQuery()
  const [requestManagementPermission] = useRequestManagementPermissionMutation()

  return {
    extensions: (data && data.extensions) || [],
    loading,
    error,
    manifest: (data && data.manifest) || null,
    requestManagementPermission,
    refetch,
  }
}
