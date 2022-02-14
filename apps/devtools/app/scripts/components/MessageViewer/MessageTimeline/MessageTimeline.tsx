import { Box } from '@chakra-ui/react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, CanvasRef } from 'react-scribble';
import { MessageTimelineMeta } from './types';
import { TimelineDrawer } from './TimelineDrawer';
import {
  MessageTimelineProps,
  RowMeta,
  MessageSpan as MessageSpanType,
} from './types';
import { useTimelineColors } from './colors';

const makeRowMeta = (index: number): RowMeta => ({
  rowCursor: 0,
  spans: [],
  rowIndex: index,
});

/**
 * MessageTimeline is a component that allows the user to see timing of the messages
 * in comparison to the other messages. This helps know which messages are effecting or potentially blocking other messages.
 * @param {Array<FinchDevtoolsMessage>} props.messages array of messages to display, filtered to what is to be viewed.
 * @param {number | undefined} props.startedRecordingAt the timestamp of when recording has started
 * @param {string | undefined} props.activeMessageId the message that is displayed
 * @param {function} props.selectQuery a method that allows for the selecting an active message.
 */
export const MessageTimeline: FC<MessageTimelineProps> = ({
  messages,
  startedRecordingAt,
  activeMessageId,
  selectQuery,
}) => {
  const ref = useRef<MessageTimelineMeta>({
    startedRecordingAt,
    currentTime: null,
  });
  const colors = useTimelineColors();
  const canvas = useRef<CanvasRef<CanvasRenderingContext2D, unknown>>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  /**
   * This is the method that reduces the messages into a list of spans to be viewable
   * in the timeline. Its essentially calculates the positioning base on the message compared
   * to the other messages.
   */
  const { timelineSpans, rowAmount } = useMemo(() => {
    const rows: Array<RowMeta> = [makeRowMeta(0)];
    messages.forEach(({ id, initializedAt, timeTaken }) => {
      let eligibleRow = rows.findIndex(
        row => row.rowCursor + 5 < initializedAt,
      );
      if (eligibleRow === -1) {
        rows.push(makeRowMeta(rows.length));
        eligibleRow = rows.length - 1;
      }
      rows[eligibleRow].spans.push({
        timeTaken: timeTaken ?? Date.now(),
        initializedAt,
        id,
        rowIndex: eligibleRow,
        color: activeMessageId === id ? colors.highlight : undefined,
      });
      rows[eligibleRow].rowCursor = initializedAt + (timeTaken ?? 0);
    });
    return {
      timelineSpans: rows
        .flatMap<MessageSpanType>(({ spans }) => spans.map(span => span))
        .sort((a, b) => a.initializedAt - b.initializedAt),
      rowAmount: rows.length,
    };
  }, [messages, activeMessageId]);

  const onContainerRef = (containerRef: HTMLDivElement | null) => {
    if (containerRef) {
      setContainer(containerRef);
    }
  };

  useEffect(() => {
    setContainerRect(container?.getBoundingClientRect());
  }, [container]);

  useEffect(() => {
    if (canvas.current && canvas.current.draw && canvas.current.canvas) {
      canvas.current.draw();
    }
  });

  const spanStartingTime = timelineSpans[0]?.initializedAt;
  const lastSpan = timelineSpans[timelineSpans.length - 1];
  const spanLength = timelineSpans.length;
  const startedRecording = spanStartingTime
    ? spanStartingTime - 1000
    : startedRecordingAt;
  const currentTime = lastSpan
    ? lastSpan.initializedAt + lastSpan.timeTaken + 1000
    : Date.now();

  ref.current.currentTime = currentTime;
  ref.current.startedRecordingAt = startedRecording;
  ref.current.rowAmount = Math.min(25, rowAmount);
  ref.current.spanLength = spanLength;
  ref.current.fullTimeline = currentTime - startedRecording;
  ref.current.spans = timelineSpans;

  return (
    <Box
      flex="0"
      width="100%"
      ref={onContainerRef}
      borderTop="1px solid var(--border-color)"
      borderBottom="1px solid var(--border-color)"
    >
      <Box
        cursor="crosshair"
        onClick={e => {
          const globalX = e.clientX;
          const globalY = e.clientY;
          if (e.target instanceof HTMLElement) {
            const boundingRect = e.target.getBoundingClientRect();
            const localX = globalX - boundingRect.left;
            const localY = globalY - boundingRect.top;
            /**
             * Some simple detection of which span is being clicked on.
             * @todo this can be improved quite a bit, by adding padding and resolving closest to span.
             */
            const selectedSpan = ref.current.spans?.find(
              span =>
                span.x <= localX &&
                span.x + span.width >= localX &&
                span.y <= localY &&
                span.y + span.height >= localY,
            );

            if (selectedSpan) {
              selectQuery(selectedSpan.id);
            }
          }
        }}
      >
        <Canvas
          ref={canvas}
          height={100}
          width={containerRect?.width ?? 300}
          meta={ref}
        >
          <TimelineDrawer
            spanColor={colors.span}
            labelColor={colors.label}
            borderColor={colors.border}
          />
        </Canvas>
      </Box>
    </Box>
  );
};
