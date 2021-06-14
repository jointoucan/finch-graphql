import { GetMessagesQuery } from '../../schema'
import {
  FinchResponseMessage,
  FinchStartMessage,
} from 'finch-graphql/dist/background/types'

export type FinchDevtoolsMessage = FinchStartMessage &
  Partial<FinchResponseMessage>
