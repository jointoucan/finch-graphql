import { atom } from 'jotai';
import { FinchDevtoolsMessage } from '../components/MessageViewer/types';
import { isRecordingAtom } from './devtool';

export const messagesAtom = atom<FinchDevtoolsMessage[]>([]);
export const selectedMessageIdAtom = atom<string | null>(null);
export const selectedMessageAtom = atom<FinchDevtoolsMessage | null>(get => {
  const selectedMessageId = get(selectedMessageIdAtom);
  const messages = get(messagesAtom);
  return (
    selectedMessageId &&
    messages.find(message => message.id === selectedMessageId)
  );
});

export const clearMessagesAtom = atom(null, (_, set) => {
  set(messagesAtom, []);
});

export const createMessageAtom = atom<unknown, FinchDevtoolsMessage>(
  null,
  (get, set, message) => {
    if (get(isRecordingAtom)) {
      set(messagesAtom, prev => [...prev, { ...message }]);
    }
  },
);

export const updateMessageAtom = atom<
  unknown,
  Partial<FinchDevtoolsMessage> & Pick<FinchDevtoolsMessage, 'id'>
>(null, (get, set, message) => {
  const messages = get(messagesAtom);
  const messageIndex = messages.findIndex(
    existingMessage => existingMessage.id === message.id,
  );
  const foundMessage = messages[messageIndex];
  if (foundMessage) {
    set(messagesAtom, prev => [
      ...prev.slice(0, messageIndex),
      { ...foundMessage, ...message },
      ...prev.slice(messageIndex + 1),
    ]);
  }
});
