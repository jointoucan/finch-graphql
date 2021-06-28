import { QueryExtensionArgs } from '../schema'

export const extensionsRootResolver = async () => {
  // NOTE: This will fail if there is no management permission
  try {
    const installedApps = await browser.management.getAll()
    const extensions = installedApps
      .filter(app => app.type === 'extension')
      .map(extension => ({
        ...extension,
        icon:
          ((extension.icons || []).find(icon => icon.size === 128) || {}).url ||
          browser.runtime.getURL('images/no-icon.png'),
      }))

    return extensions
  } catch (e) {
    return []
  }
}

export const extensionResolvers = {
  Query: {
    extensions: async () => extensionsRootResolver(),
    extension: async (_root: unknown, { id }: QueryExtensionArgs) => {
      const extensions = await extensionsRootResolver()
      return extensions.find(extension => extension.id === id)
    },
    manifest: async () => {
      const manifest = browser.runtime.getManifest()
      return { ...manifest, id: browser.runtime.id }
    },
  },
  Mutation: {
    requestManagementPermission: async () => {
      const resp = await browser.permissions.request({
        permissions: ['management'],
      })
      if (resp) {
        browser.runtime.reload()
      }
      return true
    },
  },
}
