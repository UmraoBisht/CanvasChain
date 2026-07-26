'use client';

import React from 'react';
import { useCanvasStore } from '../store/useCanvasStore';
import { Button, Card } from '@canvas-chain/ui';
import {
  IconLock,
  IconUnlock,
  IconCopy,
  IconTrash,
  IconLayers,
  IconRotate,
} from '@canvas-chain/icons';

const COLOR_SWATCHES = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#64748b', // Slate
  '#f8fafc', // White
  '#020617', // Black
];

export function PropertiesSidebar() {
  const {
    nodes,
    selectedNodeIds,
    updateSelectedNodes,
    deleteSelected,
    duplicateSelected,
    bringToFront,
    sendToBack,
    toggleLockSelected,
  } = useCanvasStore();

  if (selectedNodeIds.length === 0) {
    return null;
  }

  const selectedNodes = selectedNodeIds.map((id) => nodes[id]).filter(Boolean);
  const primaryNode = selectedNodes[0];
  if (!primaryNode) return null;

  const isLocked = selectedNodes.every((n) => n.locked);
  const currentFill = primaryNode.fill || 'rgba(99, 102, 241, 0.2)';
  const currentStroke = primaryNode.stroke || '#6366f1';
  const currentStrokeWidth = primaryNode.strokeWidth || 2;
  const currentOpacity = Math.round((primaryNode.opacity ?? 1) * 100);
  const currentRotation = primaryNode.rotation || 0;

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
      <Card className="w-60 p-3.5 bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl space-y-3 text-xs rounded-2xl">
        {/* Header Title & Actions */}
        <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
          <div className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
            <IconLayers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Selection ({selectedNodeIds.length})</span>
          </div>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleLockSelected}
              title={isLocked ? 'Unlock Element' : 'Lock Element'}
            >
              {isLocked ? (
                <IconLock className="w-3 h-3 text-amber-500" />
              ) : (
                <IconUnlock className="w-3 h-3 text-muted-foreground" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={duplicateSelected}
              title="Duplicate (Alt+Drag / Copy-Paste)"
            >
              <IconCopy className="w-3 h-3 text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive"
              onClick={deleteSelected}
              title="Delete (Delete / Backspace)"
            >
              <IconTrash className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Fill Color Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-muted-foreground">
            <label className="text-[11px] font-medium">Fill Color</label>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 text-[9px] px-1"
              onClick={() => updateSelectedNodes({ fill: 'transparent' })}
            >
              Transparent
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {COLOR_SWATCHES.map((color) => (
              <button
                key={`fill-${color}`}
                onClick={() => updateSelectedNodes({ fill: `${color}33` })}
                style={{ backgroundColor: color }}
                className={`w-4 h-4 rounded-full border border-border/80 transition-transform hover:scale-110 ${
                  currentFill === `${color}33` ? 'ring-2 ring-primary ring-offset-1' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stroke Color Section */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">Stroke Color</label>
          <div className="flex flex-wrap gap-1">
            {COLOR_SWATCHES.map((color) => (
              <button
                key={`stroke-${color}`}
                onClick={() => updateSelectedNodes({ stroke: color })}
                style={{ backgroundColor: color }}
                className={`w-4 h-4 rounded-full border border-border/80 transition-transform hover:scale-110 ${
                  currentStroke === color ? 'ring-2 ring-primary ring-offset-1' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stroke Width */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <label className="text-[11px] font-medium">Stroke Width</label>
            <span className="font-mono text-foreground font-semibold text-[10px]">{currentStrokeWidth}px</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 4, 6, 8].map((w) => (
              <Button
                key={`stroke-width-${w}`}
                variant={currentStrokeWidth === w ? 'default' : 'outline'}
                size="sm"
                className="h-5 w-7 text-[10px] font-mono px-0"
                onClick={() => updateSelectedNodes({ strokeWidth: w })}
              >
                {w}
              </Button>
            ))}
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <label className="text-[11px] font-medium">Opacity</label>
            <span className="font-mono text-foreground font-semibold text-[10px]">{currentOpacity}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={currentOpacity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateSelectedNodes({ opacity: Number(e.target.value) / 100 })
            }
            className="w-full accent-indigo-500 cursor-pointer h-1 bg-secondary rounded-lg"
          />
        </div>

        {/* Rotation Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <div className="flex items-center gap-1">
              <IconRotate className="w-3 h-3 text-indigo-400" />
              <label className="text-[11px] font-medium">Rotation</label>
            </div>
            <span className="font-mono text-foreground font-semibold text-[10px]">{currentRotation}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={5}
            value={currentRotation}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateSelectedNodes({ rotation: Number(e.target.value) })
            }
            className="w-full accent-indigo-500 cursor-pointer h-1 bg-secondary rounded-lg"
          />
        </div>

        {/* Layer Ordering Controls */}
        <div className="space-y-1 border-t border-border/60 pt-2">
          <label className="text-[11px] font-medium text-muted-foreground">Layer Order</label>
          <div className="grid grid-cols-2 gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px]"
              onClick={() => selectedNodeIds.forEach((id) => bringToFront(id))}
            >
              Bring to Front
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px]"
              onClick={() => selectedNodeIds.forEach((id) => sendToBack(id))}
            >
              Send to Back
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
