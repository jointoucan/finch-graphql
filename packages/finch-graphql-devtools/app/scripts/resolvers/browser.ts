import { BrowserExtensionArgs, BrowserPermissionArgs } from '../schema'

export const extensionsRootResolver = async () => {
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

export const browserResolvers = {
  Browser: {
    extensions: async () => extensionsRootResolver(),
    extension: async (_root: unknown, { id }: BrowserExtensionArgs) => {
      const extensions = await extensionsRootResolver()
      return extensions.find(extension => extension.id === id)
    },
    manifest: async () => {
      const manifest = browser.runtime.getManifest()
      return { ...manifest, id: browser.runtime.id }
    },
    permission: async (
      _root: unknown,
      { permission }: BrowserPermissionArgs,
    ) => {
      return browser.permissions.contains(permission)
    },
  },
  Query: {
    browser: () => ({}),
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
