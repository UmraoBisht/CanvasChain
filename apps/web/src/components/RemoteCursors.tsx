'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface RemoteUserCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

interface RemoteCursorsProps {
  cursors: RemoteUserCursor[];
}

export function RemoteCursors({ cursors }: RemoteCursorsProps) {
  return (
    <>
      {cursors.map((c) => (
        <SmoothCursor key={c.id} cursor={c} />
      ))}
    </>
  );
}

function SmoothCursor({ cursor }: { cursor: RemoteUserCursor }) {
  const posRef = useRef({ x: cursor.x, y: cursor.y });
  const targetRef = useRef({ x: cursor.x, y: cursor.y });
  const [renderPos, setRenderPos] = useState({ x: cursor.x, y: cursor.y });

  useEffect(() => {
    const dx = cursor.x - targetRef.current.x;
    const dy = cursor.y - targetRef.current.y;
    const dist = Math.hypot(dx, dy);

    // If mouse jumped far (>150px), snap instantly to eliminate trailing delay!
    if (dist > 150) {
      posRef.current = { x: cursor.x, y: cursor.y };
    }
    targetRef.current = { x: cursor.x, y: cursor.y };
  }, [cursor.x, cursor.y]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      const current = posRef.current;
      const target = targetRef.current;

      const dx = target.x - current.x;
      const dy = target.y - current.y;

      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        current.x += dx * 0.55; // 60fps Crisp Lerp Rate
        current.y += dy * 0.55;
        setRenderPos({ x: current.x, y: current.y });
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: `translate3d(${renderPos.x}px, ${renderPos.y}px, 0)`,
        pointerEvents: 'none',
        zIndex: 9000,
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
      className="flex items-center gap-1.5"
    >
      {/* Cursor Pointer Arrow */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={cursor.color}
        stroke="#ffffff"
        strokeWidth="1.5"
        className="filter drop-shadow-md"
      >
        <path d="M3 3l7 18 3-7 7-3L3 3z" />
      </svg>

      {/* User Name Tag Badge */}
      <div
        style={{ backgroundColor: cursor.color }}
        className="px-2 py-0.5 rounded-full text-white text-[10px] font-semibold font-sans shadow-md whitespace-nowrap"
      >
        {cursor.name}
      </div>
    </div>
  );
}
