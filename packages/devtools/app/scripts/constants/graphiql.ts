export const DefaultQuery = `
# Welcome to Finch GraphiQL Devtools
# 
# This is a set of tools for debugging your extensions 
# Finch GraphiQL Devtools. For more information please visit the docs
#
# https://jointoucan.github.io/finch-graphql/docs/devtools

query getExtensionInfo {
  browser {
    manifest {
      name
      version
    }
  }
}
`;
