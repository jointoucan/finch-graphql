export const extensionResolvers = {
  Query: {
    extensions: async () => {
      // NOTE: This will fail if there is no management permission
      try {
        const installedApps = await browser.management.getAll()
        const extensions = installedApps
          .filter(app => app.type === 'extension')
          .map(extension => ({
            ...extension,
            icon:
              ((extension.icons || []).find(icon => icon.size === 128) || {})
                .url ||
              extension.icon ||
              browser.runtime.getURL('images/no-icon.png'),
          }))

        return extensions
      } catch (e) {
        return []
      }
    },
    manifest: async () => {
      const manifest = browser.runtime.getManifest()
      return { ...manifest, id: browser.runtime.id }
    },
  },
  Mutation: {
    requestManagementPermission: async () => {
      return browser.permissions.request({ permissions: ['management'] })
    },
  },
}
