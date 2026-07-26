'use client';

import React from 'react';
import { useCanvasStore } from '../store/useCanvasStore';
import { Button, Card } from '@canvas-chain/ui';
import { generateId } from '@canvas-chain/utils';
import { CanvasNodeWithPath } from '../store/useCanvasStore';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplatesModal({ isOpen, onClose }: TemplatesModalProps) {
  const { addNode, commitHistory, setSelectedNodeIds } = useCanvasStore();

  if (!isOpen) return null;

  const loadKanbanTemplate = () => {
    commitHistory();
    const newNodes: CanvasNodeWithPath[] = [];
    const now = Date.now();

    // 3 Kanban Frame Columns
    const columns = [
      { title: 'To Do', x: 100, color: '#f59e0b33' },
      { title: 'In Progress', x: 450, color: '#3b82f633' },
      { title: 'Done', x: 800, color: '#10b98133' },
    ];

    columns.forEach((col, idx) => {
      const frameId = generateId('frame');
      newNodes.push({
        id: frameId,
        type: 'frame',
        shapeType: 'frame',
        frameTitle: col.title,
        x: col.x,
        y: 100,
        width: 300,
        height: 500,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 1,
        fill: col.color,
        stroke: '#6366f1',
        strokeWidth: 2,
        createdAt: now,
        updatedAt: now,
      });

      // Add 2 sticky notes per column
      const note1Id = generateId('sticky');
      const note2Id = generateId('sticky');

      newNodes.push({
        id: note1Id,
        type: 'shape',
        shapeType: 'sticky',
        text: `Task 1 in ${col.title}`,
        stickyColor: idx === 0 ? '#fef08a' : idx === 1 ? '#bae6fd' : '#bbf7d0',
        x: col.x + 20,
        y: 160,
        width: 260,
        height: 120,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 2,
        frameId,
        createdAt: now,
        updatedAt: now,
      });

      newNodes.push({
        id: note2Id,
        type: 'shape',
        shapeType: 'sticky',
        text: `Task 2 in ${col.title}`,
        stickyColor: idx === 0 ? '#fef08a' : idx === 1 ? '#bae6fd' : '#bbf7d0',
        x: col.x + 20,
        y: 300,
        width: 260,
        height: 120,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 2,
        frameId,
        createdAt: now,
        updatedAt: now,
      });
    });

    newNodes.forEach((node) => addNode(node));
    setSelectedNodeIds(newNodes.map((n) => n.id));
    onClose();
  };

  const loadMindMapTemplate = () => {
    commitHistory();
    const newNodes: CanvasNodeWithPath[] = [];
    const now = Date.now();

    // Central Node
    const centerId = generateId('circle');
    newNodes.push({
      id: centerId,
      type: 'shape',
      shapeType: 'circle',
      text: 'Main Project Idea',
      x: 500,
      y: 300,
      width: 160,
      height: 160,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
      fill: 'rgba(99, 102, 241, 0.4)',
      stroke: '#6366f1',
      strokeWidth: 3,
      createdAt: now,
      updatedAt: now,
    });

    // 4 Branch Nodes
    const branches = [
      { title: 'Feature Set', x: 200, y: 150 },
      { title: 'Design System', x: 800, y: 150 },
      { title: 'Tech Stack', x: 200, y: 450 },
      { title: 'Deployment', x: 800, y: 450 },
    ];

    branches.forEach((b) => {
      const branchId = generateId('rectangle');
      newNodes.push({
        id: branchId,
        type: 'shape',
        shapeType: 'rectangle',
        text: b.title,
        x: b.x,
        y: b.y,
        width: 140,
        height: 70,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 2,
        fill: 'rgba(16, 185, 129, 0.2)',
        stroke: '#10b981',
        strokeWidth: 2,
        createdAt: now,
        updatedAt: now,
      });

      // Connector line
      const connId = generateId('connector');
      newNodes.push({
        id: connId,
        type: 'shape',
        shapeType: 'connector',
        startNodeId: centerId,
        endNodeId: branchId,
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 1,
        stroke: '#6366f1',
        strokeWidth: 2,
        createdAt: now,
        updatedAt: now,
      });
    });

    newNodes.forEach((node) => addNode(node));
    setSelectedNodeIds(newNodes.map((n) => n.id));
    onClose();
  };

  const loadFlowchartTemplate = () => {
    commitHistory();
    const newNodes: CanvasNodeWithPath[] = [];
    const now = Date.now();

    // Start Circle
    const startId = generateId('circle');
    newNodes.push({
      id: startId,
      type: 'shape',
      shapeType: 'circle',
      text: 'Start Flow',
      x: 100,
      y: 250,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
      fill: 'rgba(59, 130, 246, 0.3)',
      stroke: '#3b82f6',
      strokeWidth: 2,
      createdAt: now,
      updatedAt: now,
    });

    // Process Box
    const processId = generateId('rectangle');
    newNodes.push({
      id: processId,
      type: 'shape',
      shapeType: 'rectangle',
      text: 'Process Input Data',
      x: 300,
      y: 260,
      width: 160,
      height: 80,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
      fill: 'rgba(99, 102, 241, 0.3)',
      stroke: '#6366f1',
      strokeWidth: 2,
      createdAt: now,
      updatedAt: now,
    });

    // Decision Diamond
    const decisionId = generateId('rectangle');
    newNodes.push({
      id: decisionId,
      type: 'shape',
      shapeType: 'rectangle',
      text: 'Is Valid?',
      x: 550,
      y: 250,
      width: 100,
      height: 100,
      rotation: 45,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
      fill: 'rgba(245, 158, 11, 0.3)',
      stroke: '#f59e0b',
      strokeWidth: 2,
      createdAt: now,
      updatedAt: now,
    });

    // Connectors
    const c1 = generateId('arrow');
    newNodes.push({
      id: c1,
      type: 'shape',
      shapeType: 'arrow',
      x: 200,
      y: 300,
      width: 100,
      height: 0,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
      stroke: '#6366f1',
      strokeWidth: 2,
      createdAt: now,
      updatedAt: now,
    });

    const c2 = generateId('arrow');
    newNodes.push({
      id: c2,
      type: 'shape',
      shapeType: 'arrow',
      x: 460,
      y: 300,
      width: 90,
      height: 0,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
      stroke: '#6366f1',
      strokeWidth: 2,
      createdAt: now,
      updatedAt: now,
    });

    newNodes.forEach((node) => addNode(node));
    setSelectedNodeIds(newNodes.map((n) => n.id));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-xl p-6 bg-card border border-border shadow-2xl space-y-6 rounded-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Canvas Templates</h2>
            <p className="text-xs text-muted-foreground">Inject pre-built professional whiteboard layouts.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div
            onClick={loadKanbanTemplate}
            className="p-4 border border-border/80 rounded-xl hover:border-indigo-500 hover:bg-indigo-500/10 cursor-pointer transition-all space-y-2 text-center"
          >
            <div className="text-2xl">📋</div>
            <div className="font-semibold text-sm">Kanban Board</div>
            <div className="text-[11px] text-muted-foreground">To Do, In Progress, Done columns with sticky notes.</div>
          </div>

          <div
            onClick={loadMindMapTemplate}
            className="p-4 border border-border/80 rounded-xl hover:border-indigo-500 hover:bg-indigo-500/10 cursor-pointer transition-all space-y-2 text-center"
          >
            <div className="text-2xl">🧠</div>
            <div className="font-semibold text-sm">Mind Map</div>
            <div className="text-[11px] text-muted-foreground">Central topic with branching connected idea nodes.</div>
          </div>

          <div
            onClick={loadFlowchartTemplate}
            className="p-4 border border-border/80 rounded-xl hover:border-indigo-500 hover:bg-indigo-500/10 cursor-pointer transition-all space-y-2 text-center"
          >
            <div className="text-2xl">🔀</div>
            <div className="font-semibold text-sm">User Flowchart</div>
            <div className="text-[11px] text-muted-foreground">Start node, process boxes, decision diamonds, arrows.</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
