'use client';

import React from 'react';
import { useCanvasStore } from '../store/useCanvasStore';
import { Button, Card } from '@canvas-chain/ui';
import {
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignTop,
  IconAlignMiddle,
  IconAlignBottom,
  IconDistributeH,
  IconDistributeV,
  IconGroup,
  IconUngroup,
} from '@canvas-chain/icons';

export function AlignmentToolbar() {
  const { selectedNodeIds, nodes, alignSelected, distributeSelected, groupSelected, ungroupSelected } =
    useCanvasStore();

  if (selectedNodeIds.length < 2) return null;

  const isGroupSelected = selectedNodeIds.some((id) => nodes[id]?.shapeType === 'group');

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <Card className="px-3 py-1.5 bg-card/90 backdrop-blur-md border border-border/80 shadow-2xl flex items-center gap-1 text-xs rounded-full">
        {/* Align Left, Center, Right */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => alignSelected('left')}
          title="Align Left"
        >
          <IconAlignLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => alignSelected('center')}
          title="Align Horizontal Center"
        >
          <IconAlignCenter className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => alignSelected('right')}
          title="Align Right"
        >
          <IconAlignRight className="w-3.5 h-3.5" />
        </Button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* Align Top, Middle, Bottom */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => alignSelected('top')}
          title="Align Top"
        >
          <IconAlignTop className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => alignSelected('middle')}
          title="Align Vertical Center"
        >
          <IconAlignMiddle className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => alignSelected('bottom')}
          title="Align Bottom"
        >
          <IconAlignBottom className="w-3.5 h-3.5" />
        </Button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* Distribute Horizontally / Vertically */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => distributeSelected('horizontal')}
          title="Distribute Horizontally"
        >
          <IconDistributeH className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => distributeSelected('vertical')}
          title="Distribute Vertically"
        >
          <IconDistributeV className="w-3.5 h-3.5" />
        </Button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* Group / Ungroup */}
        {isGroupSelected ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 px-2 text-indigo-400"
            onClick={ungroupSelected}
            title="Ungroup Elements (Ctrl+Shift+G)"
          >
            <IconUngroup className="w-3.5 h-3.5" />
            <span>Ungroup</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 px-2 text-indigo-400"
            onClick={groupSelected}
            title="Group Elements (Ctrl+G)"
          >
            <IconGroup className="w-3.5 h-3.5" />
            <span>Group</span>
          </Button>
        )}
      </Card>
    </div>
  );
}
