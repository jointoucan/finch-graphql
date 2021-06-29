import { useMutation, useQuery } from 'finch-graphql'
import gql from 'graphql-tag'
import {
  useGetExtensionsQuery,
  useRequestManagementPermissionMutation,
} from '../schema'

export const useInstalledExtensions = () => {
  const { data, loading, error, refetch } = useGetExtensionsQuery()
  const [requestManagementPermission] = useRequestManagementPermissionMutation()

  const extensions =
    data?.browser?.extensions?.filter(extension => extension.enabled) ?? []
  const disabledExtensions =
    data?.browser?.extensions?.filter(extension => !extension.enabled) ?? []

  return {
    extensions,
    disabledExtensions,
    loading,
    error,
    manifest: data?.browser.manifest || null,
    requestManagementPermission,
    refetch,
  }
}
