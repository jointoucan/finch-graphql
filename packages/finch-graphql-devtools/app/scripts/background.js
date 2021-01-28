browser.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion)
})
