import { useQuery } from 'finch-graphql'
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

export const useInstalledExtensions = () => {
  const { data, loading, error } = useQuery(GetExtensionsDoc)

  return {
    extensions: (data && data.extensions) || [],
    loading,
    error,
    manifest: (data && data.manifest) || null,
  }
}
