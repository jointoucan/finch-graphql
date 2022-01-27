import { Box } from '@chakra-ui/react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, CanvasRef } from 'react-scribble';
import { MessageTimelineMeta } from './types';
// import { MessageSpan } from './MessageSpan';
import { TimelineDrawer } from './TimelineDrawer';
import {
  MessageTimelineProps,
  RowMeta,
  MessageSpan as MessageSpanType,
} from './types';

const makeRowMeta = (index: number): RowMeta => ({
  rowCursor: 0,
  spans: [],
  rowIndex: index,
});

export const MessageTimeline: FC<MessageTimelineProps> = ({
  messages,
  startedRecordingAt,
  activeMessageId,
  selectQuery,
}) => {
  /**
   * To get this timeline to work with hovers, zooms and stuff we will needs to
   * calculate a lot of stuff in the top level container. This would allow us to
   * know when something is being hovered. Also the zooming of the timeline would
   */
  const ref = useRef<MessageTimelineMeta>({
    startedRecordingAt,
    currentTime: null,
  });
  const canvas = useRef<CanvasRef<CanvasRenderingContext2D, unknown>>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
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
        color: activeMessageId === id ? '#F8C06D' : undefined,
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
  const startedRecording = startedRecordingAt || spanStartingTime - 1000;
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
            // Detect the span we are over.
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
          <TimelineDrawer />
        </Canvas>
      </Box>
    </Box>
  );
};
