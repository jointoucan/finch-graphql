export const StorageKey = {
  ExtensionId: 'finch:extension-id',
  MessageKey: 'finch:message-key',
  TabIndex: 'finch:tab-index',
}

export const DefaultQuery = `
# Welcome to GraphiQL for Finch GraphQL
#
# GraphiQL is an in-browser tool for writing, validating, and
# testing GraphQL queries. Try it out. 
#
# First you will need to connect you extension to Finch GraphiQL.
# To do this head over to the setting tab and insert the extensionID
# of your extension into the field. If you have a custom message key
# pass that into the message key feild. 
#
# If you have not yet you will need to setup externally connects in
# you extention, the Finch GraphiQL extensionID needs to be put into
# the "ids" section.
#
# https://developer.chrome.com/docs/extensions/mv2/manifest/externally_connectable/
#
# query getExtensionInfo {
#   browser {
#     manifest {
#       name
#       version
#     }
#   }
# }
#`
