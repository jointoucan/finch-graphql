import gql from 'graphql-tag'

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
