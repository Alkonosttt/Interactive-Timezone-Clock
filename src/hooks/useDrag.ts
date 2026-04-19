import { useCallback, useRef } from "react";

export function useClockDrag(
  center: { x: number; y: number },
  onAngleChange: (angleDeg: number) => void
) {
  const dragging = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const rect = (e.currentTarget as SVGElement)
      .getBoundingClientRect();
    const dx = e.clientX - rect.left - center.x;
    const dy = e.clientY - rect.top  - center.y;
    // atan2 from top, clockwise
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    onAngleChange(angle);
  }, [center, onAngleChange]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp };
}