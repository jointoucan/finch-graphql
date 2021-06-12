import { GetMessagesQuery } from '../../schema'

export type FinchMessage = GetMessagesQuery['_finchDevtools']['messages'][number]

export type FinchMessageParsed = Pick<
  FinchMessage,
  'initializedAt' | 'operationName' | 'rawQuery' | 'timeTaken'
> & { response: any; variables: any; context: any; id: string }
