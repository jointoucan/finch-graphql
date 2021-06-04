import { useMutation, useQuery } from 'finch-graphql'
import gql from 'graphql-tag'

const GetExtensionsDoc = gql`
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
`
const RequestManagementPermissionDoc = gql`
  mutation requestManagementPermission {
    requestManagementPermission
  }
`

export const useInstalledExtensions = () => {
  const { data, loading, error, refetch } = useQuery(GetExtensionsDoc)
  const [requestManagementPermission] = useMutation(
    RequestManagementPermissionDoc,
  )

  return {
    extensions: (data && data.extensions) || [],
    loading,
    error,
    manifest: (data && data.manifest) || null,
    requestManagementPermission,
    refetch,
  }
}
