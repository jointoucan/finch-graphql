export const extensionResolvers = {
  Query: {
    extensions: async () => {
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
    },
    manifest: async () => {
      const manifest = browser.runtime.getManifest()
      return { ...manifest, id: browser.runtime.id }
    },
  },
}
