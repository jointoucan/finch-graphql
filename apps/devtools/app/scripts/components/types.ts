import { FinchConnectionType } from '@finch-graphql/types';

export interface ConnectionInfo {
  messageKey?: string;
  nickName?: null | string;
  messagePortName?: string;
  connectionType?: FinchConnectionType;
}
