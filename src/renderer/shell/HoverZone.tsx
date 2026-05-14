import { useEffect, useRef, useCallback } from 'react';

interface HoverZoneProps {
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export function HoverZone({ onHoverStart, onHoverEnd }: HoverZoneProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleEnter = useCallback(() => {
    clearTimeout(timerRef.current);
    onHoverStart();
  }, [onHoverStart]);

  const handleLeave = useCallback(() => {
    timerRef.current = setTimeout(onHoverEnd, 3000);
  }, [onHoverEnd]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div
      className="hover-zone"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    />
  );
}
