import { atom } from 'jotai';

export const recordingAtAtom = atom<number>(0);
export const isRecordingAtom = atom<boolean>(get => !!get(recordingAtAtom));
