/* ============================================
   LIVE VALUE COMPONENT
   Displays values with a flash animation
   when the value changes from simulation ticks.
   ============================================ */

import { useRef, useEffect, useState } from 'react';

interface LiveValueProps {
  value: string | number;
  className?: string;
}

/**
 * Renders a value that flashes with an accent color
 * whenever it changes. Used for simulation-driven metrics.
 */
export function LiveValue({ value, className = '' }: LiveValueProps) {
  const prevRef = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 800);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span className={`${className}${flash ? ' value-updated' : ''}`}>
      {value}
    </span>
  );
}
