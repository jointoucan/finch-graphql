import { FinchDevtoolsMessage } from '../types';

export interface MessageTimelineProps {
  messages: Array<FinchDevtoolsMessage>;
  isRecording: boolean;
  startedRecordingAt: number | null;
  activeMessageId: string | null;
  selectQuery: React.Dispatch<string | null>;
}

export interface MessageSpan {
  initializedAt: number;
  timeTaken?: number;
  id: string;
  rowIndex: number;
  // These are populated in the render loop
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
}

export interface RowMeta {
  rowCursor: number;
  spans: Array<MessageSpan>;
  rowIndex: number;
}

export interface TimelineMarker {
  x: number;
  label: string;
}

export interface MessageTimelineMeta {
  startedRecordingAt: number | null;
  currentTime?: number | null;
  rowAmount?: number | null;
  pxPerMs?: number | null;
  spans?: Array<MessageSpan>;
  markers?: Array<TimelineMarker>;
  spanLength?: number | null;
  fullTimeline?: number;
}
