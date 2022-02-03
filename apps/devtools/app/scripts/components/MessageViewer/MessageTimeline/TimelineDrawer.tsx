import { FC, RefObject } from 'react';
import { useDraw } from 'react-scribble';
import { MessageTimelineMeta } from './types';

interface TimelineMarkersProps {
  spanColor: string;
  borderColor: string;
  labelColor: string;
}

/**
 * TimelineDrawer this is a component that essentially draws all the shapes to the canvas.
 * We currently use a library react-scribble that handles the draw. It gets called every draw.
 * @param {string} props.spanColor The color of the spans that we draw, active spans will be colored differently.
 * @param {string} props.borderColor The color of the border of the canvas.
 * @param {string} props.labelColor The color of the labels on the canvas.
 */
export const TimelineDrawer: FC<TimelineMarkersProps> = ({
  spanColor,
  borderColor,
  labelColor,
}) => {
  useDraw(
    (ctx, canvas, meta: RefObject<MessageTimelineMeta>) => {
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
        ctx.fillStyle = borderColor;
        ctx.beginPath();
        ctx.rect(x, 0, 1, canvas.height);
        ctx.fill();

        return {
          label: `${(marker + 1) * timeframe}ms`,
          x,
        };
      });

      /**
       * Renders the spans, calculates the x, y, width and height of the spans,
       * relative to the size of the canvas.
       */
      meta.current.spans = meta.current.spans.map(span => {
        const { initializedAt, timeTaken, rowIndex, color } = span;
        const offset = startedRecordingAt - initializedAt;
        const x = Math.abs(Math.floor(pxPerMs * offset));
        const y = rowIndex * Math.floor(canvas.height / meta.current.rowAmount);
        const width = Math.max(1, Math.floor(pxPerMs * timeTaken));
        const height = Math.floor(canvas.height / meta.current.rowAmount) - 2;

        ctx.fillStyle = color ?? spanColor;
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
        ctx.fillStyle = labelColor;
        ctx.beginPath();
        ctx.fillText(marker.label, marker.x + 5, canvas.height - 5);
        ctx.fill();
      });

      // anti aliasing end
      ctx.translate(-0.5, -0.5);
    },
    [labelColor, spanColor, borderColor],
  );

  return null;
};
