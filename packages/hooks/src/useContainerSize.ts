import { useState, useEffect, RefObject } from 'react';
import { Size2D } from '@canvas-chain/types';

export function useContainerSize(ref: RefObject<HTMLElement | null>): Size2D {
  const [size, setSize] = useState<Size2D>({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
