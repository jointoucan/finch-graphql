import gql from 'graphql-tag'

// NOTE: these currently hit other extensions,
// and is why this is not in codegen

export const MessagePullQueryDoc = gql`
  query getMessages {
    _finchDevtools {
      enabled
      messages {
        operationName
        rawQuery
        variables
        initializedAt
        timeTaken
        response
        context
      }
    }
  }
`

export const EnableMessagesDoc = gql`
  mutation enableMessages {
    _enableFinchDevtools(enabled: true)
  }
`
