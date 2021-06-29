import { useGetExtensionsQuery } from '../schema'

export const useInstalledExtensions = () => {
  const { data, loading, error, refetch } = useGetExtensionsQuery()

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
    refetch,
  }
}
