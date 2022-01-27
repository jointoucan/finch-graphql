import { FC, RefObject } from 'react';
import { useDraw } from 'react-scribble';
import { MessageTimelineMeta } from './types';

interface TimelineMarkersProps {}

export const TimelineDrawer: FC<TimelineMarkersProps> = () => {
  useDraw((ctx, canvas, meta: RefObject<MessageTimelineMeta>) => {
    const { fullTimeline, startedRecordingAt } = meta.current;

    const pxPerMs = canvas.width / fullTimeline;
    meta.current.pxPerMs = pxPerMs;

    // Marker every second
    let timeframe = 500;
    let markerAmount = Math.floor(fullTimeline / timeframe);
    while (markerAmount > 5) {
      timeframe *= 2;
      markerAmount = Math.floor(fullTimeline / timeframe);
    }

    // anti aliasing start
    ctx.translate(0.5, 0.5);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw markers
    const markers = (markerAmount
      ? Array.from(Array(markerAmount).keys())
      : []
    ).map(marker => {
      const x = Math.floor((marker + 1) * timeframe * pxPerMs);
      ctx.fillStyle = '#4a5568';
      ctx.beginPath();
      ctx.rect(x, 0, 1, canvas.height);
      ctx.fill();

      return {
        label: `${(marker + 1) * timeframe}ms`,
        x,
      };
    });

    // Render the spans
    meta.current.spans = meta.current.spans.map(span => {
      const { initializedAt, timeTaken, rowIndex, color } = span;
      const offset = startedRecordingAt - initializedAt;
      const x = Math.abs(Math.floor(pxPerMs * offset));
      const y = rowIndex * Math.floor(canvas.height / meta.current.rowAmount);
      const width = Math.max(1, Math.floor(pxPerMs * timeTaken));
      const height = Math.floor(canvas.height / meta.current.rowAmount) - 2;

      ctx.fillStyle = color ?? '#4a5568';
      const rect = new Path2D();
      rect.rect(x, y, width, height);
      ctx.fill(rect);
      return {
        ...span,
        x,
        y,
        width,
        height,
      };
    });

    // Draw the labels for the markers above the spans
    markers.forEach(marker => {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.fillText(marker.label, marker.x + 5, canvas.height - 5);
      ctx.fill();
    });

    // anti aliasing end
    ctx.translate(-0.5, -0.5);
  }, []);

  return null;
};
