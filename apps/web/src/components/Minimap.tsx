'use client';

import React, { useRef, useEffect } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';

export function Minimap() {
  const { nodes, viewport, setViewport } = useCanvasStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const MINIMAP_WIDTH = 150;
  const MINIMAP_HEIGHT = 90;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    // Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    const nodeList = Object.values(nodes);
    if (nodeList.length === 0) return;

    // Bounds calculation
    const minX = Math.min(-1000, ...nodeList.map((n) => n.x));
    const minY = Math.min(-1000, ...nodeList.map((n) => n.y));
    const maxX = Math.max(1000, ...nodeList.map((n) => n.x + n.width));
    const maxY = Math.max(1000, ...nodeList.map((n) => n.y + n.height));

    const worldWidth = maxX - minX;
    const worldHeight = maxY - minY;

    const scaleX = MINIMAP_WIDTH / worldWidth;
    const scaleY = MINIMAP_HEIGHT / worldHeight;
    const scale = Math.min(scaleX, scaleY);

    // Render nodes
    ctx.fillStyle = '#6366f1';
    nodeList.forEach((node) => {
      const mx = (node.x - minX) * scale;
      const my = (node.y - minY) * scale;
      const mw = Math.max(2, node.width * scale);
      const mh = Math.max(2, node.height * scale);
      ctx.fillRect(mx, my, mw, mh);
    });

    // Render Viewport Box
    const vpX = (-viewport.x - minX) * scale;
    const vpY = (-viewport.y - minY) * scale;
    const vpW = (window.innerWidth / viewport.zoom) * scale;
    const vpH = (window.innerHeight / viewport.zoom) * scale;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vpX, vpY, vpW, vpH);
  }, [nodes, viewport]);

  const handleMinimapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const nodeList = Object.values(nodes);
    const minX = Math.min(-1000, ...nodeList.map((n) => n.x));
    const minY = Math.min(-1000, ...nodeList.map((n) => n.y));
    const maxX = Math.max(1000, ...nodeList.map((n) => n.x + n.width));
    const maxY = Math.max(1000, ...nodeList.map((n) => n.y + n.height));

    const scaleX = MINIMAP_WIDTH / (maxX - minX);
    const scaleY = MINIMAP_HEIGHT / (maxY - minY);
    const scale = Math.min(scaleX, scaleY);

    const worldX = minX + clickX / scale;
    const worldY = minY + clickY / scale;

    setViewport({
      ...viewport,
      x: -worldX + window.innerWidth / 2,
      y: -worldY + window.innerHeight / 2,
    });
  };

  return (
    <div className="absolute bottom-4 left-64 z-30 pointer-events-auto shadow-xl rounded-lg overflow-hidden border border-border/80 bg-card/90 backdrop-blur-md">
      <canvas
        ref={canvasRef}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        onClick={handleMinimapClick}
        className="cursor-pointer block"
        title="Click to jump viewport"
      />
    </div>
  );
}
