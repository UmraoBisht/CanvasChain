'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useCanvasStore, CanvasNodeWithPath } from '../store/useCanvasStore';
import { generateId, snapToGrid, distance } from '@canvas-chain/utils';
import { BoundingBox } from '@canvas-chain/types';
import { IconEraser, IconPencil, IconComment } from '@canvas-chain/icons';
import { Button } from '@canvas-chain/ui';

const STORAGE_KEY = 'canvas_chain_nodes_v1';

function splitPointsByEraser(points: { x: number; y: number }[], eraserCoords: { x: number; y: number }, radius = 20) {
  const segments: { x: number; y: number }[][] = [];
  let currentSegment: { x: number; y: number }[] = [];

  for (const pt of points) {
    if (distance(pt, eraserCoords) <= radius) {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }
    } else {
      currentSegment.push(pt);
    }
  }
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
}

import { RemoteCursors, RemoteUserCursor } from './RemoteCursors';

export interface InteractiveCanvasProps {
  remoteCursors?: RemoteUserCursor[];
  role?: 'editor' | 'viewer';
  onCursorMove?: (coords: { x: number; y: number }) => void;
}

export function InteractiveCanvas({
  remoteCursors = [],
  role = 'editor',
  onCursorMove,
}: InteractiveCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    nodes,
    selectedNodeIds,
    activeTool,
    viewport,
    isGridVisible,
    isSnapToGridEnabled,
    gridSize,
    setActiveTool,
    toggleGrid,
    addNode,
    updateNode,
    removeNode,
    deleteSelected,
    setSelectedNodeIds,
    clearSelection,
    selectAll,
    selectNodesInMarquee,
    panViewport,
    zoomViewport,
    zoomIn,
    zoomOut,
    resetZoom,
    undo,
    redo,
    copySelected,
    pasteClipboard,
    duplicateSelected,
    loadWorkspaceState,
    addCommentReply,
    toggleCommentResolved,
  } = useCanvasStore();

  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeDrawingId, setActiveDrawingId] = useState<string | null>(null);
  const [drawingStartCoords, setDrawingStartCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodeOffset, setNodeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [commentReplyText, setCommentReplyText] = useState('');

  // Floating Lucide Mouse Cursor position
  const [mouseScreenPos, setMouseScreenPos] = useState<{ x: number; y: number } | null>(null);

  // Selection Marquee state
  const [marquee, setMarquee] = useState<BoundingBox | null>(null);

  // Resizing state
  const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    nodeX: number;
    nodeY: number;
  }>({ x: 0, y: 0, width: 0, height: 0, nodeX: 0, nodeY: 0 });

  // Rotating state
  const [rotatingNodeId, setRotatingNodeId] = useState<string | null>(null);
  const [rotateStartAngle, setRotateStartAngle] = useState<number>(0);
  const [nodeInitialRotation, setNodeInitialRotation] = useState<number>(0);

  // Trigger file picker when Image tool selected
  useEffect(() => {
    if (activeTool === 'image' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [activeTool]);

  // LocalStorage Auto-Save & Hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          loadWorkspaceState(parsed);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [loadWorkspaceState]);

  useEffect(() => {
    if (Object.keys(nodes).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
      } catch (e) {
        // ignore
      }
    }
  }, [nodes]);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && ['input', 'textarea'].includes(target.tagName.toLowerCase())) {
        return;
      }

      const key = e.key.toLowerCase();

      // Undo / Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.shiftKey && key === 'z') {
          e.preventDefault();
          redo();
          return;
        }
        if (key === 'z') {
          e.preventDefault();
          undo();
          return;
        }
        if (key === 'y') {
          e.preventDefault();
          redo();
          return;
        }
        if (key === 'c') {
          e.preventDefault();
          copySelected();
          return;
        }
        if (key === 'v') {
          e.preventDefault();
          pasteClipboard();
          return;
        }
        if (key === 'a') {
          e.preventDefault();
          selectAll();
          return;
        }
        if (key === '=' || key === '+') {
          e.preventDefault();
          zoomIn();
          return;
        }
        if (key === '-' || key === '_') {
          e.preventDefault();
          zoomOut();
          return;
        }
        if (key === '0') {
          e.preventDefault();
          resetZoom();
          return;
        }
      }

      if (key === '=' || key === '+') zoomIn();
      else if (key === '-' || key === '_') zoomOut();
      else if (key === '0') resetZoom();
      else if (key === 'v' || key === '1') setActiveTool('select');
      else if (key === 'h' || key === '2') setActiveTool('pan');
      else if (key === 'r' || key === '3') setActiveTool('rectangle');
      else if (key === 'c' || key === 'o' || key === '4') setActiveTool('circle');
      else if (key === 'l' || key === '5') setActiveTool('line');
      else if (key === 'a' || key === '6') setActiveTool('arrow');
      else if (key === 't' || key === '7') setActiveTool('text');
      else if (key === 'p' || key === 'd' || key === '8') setActiveTool('pencil');
      else if (key === 'e' || key === '9') setActiveTool('eraser');
      else if (key === 'f') setActiveTool('frame');
      else if (key === 's') setActiveTool('sticky');
      else if (key === 'i') setActiveTool('image');
      else if (key === 'k') setActiveTool('table');
      else if (key === 'x') setActiveTool('connector');
      else if (key === 'm') setActiveTool('comment');
      else if (key === 'g') toggleGrid();
      else if (key === 'delete' || key === 'backspace') {
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setActiveTool,
    toggleGrid,
    deleteSelected,
    zoomIn,
    zoomOut,
    resetZoom,
    undo,
    redo,
    copySelected,
    pasteClipboard,
    selectAll,
  ]);

  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = (clientX - rect.left - viewport.x) / viewport.zoom;
      const rawY = (clientY - rect.top - viewport.y) / viewport.zoom;

      if (isSnapToGridEnabled && activeTool !== 'pencil') {
        return {
          x: snapToGrid(rawX, gridSize),
          y: snapToGrid(rawY, gridSize),
        };
      }
      return { x: rawX, y: rawY };
    },
    [viewport, isSnapToGridEnabled, gridSize, activeTool],
  );

  const getToolCursorStyle = (): string => {
    if (isPanning) return 'grabbing';
    switch (activeTool) {
      case 'select':
        return 'default';
      case 'pan':
        return 'grab';
      case 'text':
        return 'text';
      case 'eraser':
      case 'pencil':
        return 'none';
      case 'rectangle':
      case 'circle':
      case 'line':
      case 'arrow':
      case 'frame':
      case 'sticky':
      case 'table':
      case 'connector':
      case 'comment':
      default:
        return 'crosshair';
    }
  };

  const findNodeAtCoords = (coords: { x: number; y: number }) => {
    const matches = Object.values(nodes).filter((node) => {
      if (node.shapeType === 'pencil' && node.points) {
        return node.points.some((pt) => distance(pt, coords) < 15);
      }
      return (
        coords.x >= node.x &&
        coords.x <= node.x + node.width &&
        coords.y >= node.y &&
        coords.y <= node.y + node.height
      );
    });
    if (matches.length === 0) return undefined;
    return matches.sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))[0];
  };

  // Handle Image File Upload
  const handleImageUpload = (file: File, coords?: { x: number; y: number }) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const id = generateId('image');
      const maxZ = Math.max(0, ...Object.values(nodes).map((n) => n.zIndex || 0));
      const targetCoords = coords || { x: -viewport.x + 200, y: -viewport.y + 200 };

      const imgNode: CanvasNodeWithPath = {
        id,
        type: 'shape',
        shapeType: 'image',
        src,
        x: targetCoords.x,
        y: targetCoords.y,
        width: 300,
        height: 200,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: maxZ + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      addNode(imgNode);
      setSelectedNodeIds([id]);
      setActiveTool('select');
    };
    reader.readAsDataURL(file);
  };

  // Erase points / shapes under coordinates with stroke splitting
  const eraseAtCoords = useCallback(
    (coords: { x: number; y: number }) => {
      const eraserRadius = 20;

      Object.values(nodes).forEach((node) => {
        if (node.shapeType === 'pencil' && node.points && node.points.length > 0) {
          const segments = splitPointsByEraser(node.points, coords, eraserRadius);

          if (segments.length === 0) {
            removeNode(node.id);
          } else {
            updateNode(node.id, { points: segments[0] });

            for (let i = 1; i < segments.length; i++) {
              if (segments[i].length > 0) {
                const newId = generateId('pencil');
                const newPencilNode: CanvasNodeWithPath = {
                  ...JSON.parse(JSON.stringify(node)),
                  id: newId,
                  points: segments[i],
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                };
                addNode(newPencilNode);
              }
            }
          }
        } else {
          const isHit =
            coords.x >= node.x &&
            coords.x <= node.x + node.width &&
            coords.y >= node.y &&
            coords.y <= node.y + node.height;
          if (isHit) {
            removeNode(node.id);
          }
        }
      });
    },
    [nodes, removeNode, updateNode, addNode],
  );

  const startResizing = (e: React.PointerEvent, nodeId: string, handle: string) => {
    e.stopPropagation();
    const node = nodes[nodeId];
    if (!node || node.locked) return;
    setResizingNodeId(nodeId);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: node.width,
      height: node.height,
      nodeX: node.x,
      nodeY: node.y,
    });
  };

  const startRotating = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes[nodeId];
    if (!node || node.locked) return;
    const centerX = node.x + node.width / 2;
    const centerY = node.y + node.height / 2;
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    const angle = Math.atan2(coords.y - centerY, coords.x - centerX) * (180 / Math.PI);

    setRotatingNodeId(nodeId);
    setRotateStartAngle(angle);
    setNodeInitialRotation(node.rotation || 0);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button === 1 || e.buttons === 4 || activeTool === 'pan') {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const coords = getCanvasCoordinates(e.clientX, e.clientY);

    // Eraser Tool
    if (activeTool === 'eraser') {
      eraseAtCoords(coords);
      return;
    }

    // Select Tool: Click to select & drag existing node OR start marquee
    if (activeTool === 'select') {
      const clickedNode = findNodeAtCoords(coords);
      if (clickedNode) {
        if (e.altKey) {
          duplicateSelected();
        }
        setSelectedNodeIds([clickedNode.id]);
        setDraggingNodeId(clickedNode.id);
        setNodeOffset({ x: coords.x - clickedNode.x, y: coords.y - clickedNode.y });
      } else {
        clearSelection();
        setEditingNodeId(null);
        setMarquee({ x: coords.x, y: coords.y, width: 0, height: 0 });
        setDrawingStartCoords(coords);
      }
      return;
    }

    // Text / Sticky / Comment Tool editing
    if (['text', 'sticky'].includes(activeTool)) {
      const clickedNode = findNodeAtCoords(coords);
      if (clickedNode && clickedNode.shapeType === activeTool) {
        setEditingNodeId(clickedNode.id);
        setSelectedNodeIds([clickedNode.id]);
        setActiveTool('select');
        return;
      }
    }

    // Create new element
    const id = generateId(activeTool);
    const maxZ = Math.max(0, ...Object.values(nodes).map((n) => n.zIndex || 0));

    if (activeTool === 'pencil') {
      const newNode: CanvasNodeWithPath = {
        id,
        type: 'shape',
        shapeType: 'pencil',
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: maxZ + 1,
        stroke: '#6366f1',
        strokeWidth: 3,
        points: [coords],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addNode(newNode);
      setActiveDrawingId(id);
      setDrawingStartCoords(coords);
      return;
    }

    if (activeTool === 'comment') {
      const newNode: CanvasNodeWithPath = {
        id,
        type: 'comment',
        shapeType: 'comment',
        x: coords.x,
        y: coords.y,
        width: 36,
        height: 36,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: maxZ + 1,
        commentAuthor: 'User',
        commentReplies: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addNode(newNode);
      setSelectedNodeIds([id]);
      setActiveTool('select');
      return;
    }

    if (activeTool === 'sticky') {
      const newNode: CanvasNodeWithPath = {
        id,
        type: 'shape',
        shapeType: 'sticky',
        text: 'New Sticky Note',
        stickyColor: '#fef08a', // Yellow
        x: coords.x,
        y: coords.y,
        width: 200,
        height: 160,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: maxZ + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addNode(newNode);
      setSelectedNodeIds([id]);
      setEditingNodeId(id);
      setActiveTool('select');
      return;
    }

    if (activeTool === 'frame') {
      const newNode: CanvasNodeWithPath = {
        id,
        type: 'frame',
        shapeType: 'frame',
        frameTitle: `Frame ${Object.values(nodes).filter((n) => n.shapeType === 'frame').length + 1}`,
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: maxZ + 1,
        fill: 'rgba(99, 102, 241, 0.05)',
        stroke: '#6366f1',
        strokeWidth: 2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addNode(newNode);
      setActiveDrawingId(id);
      setDrawingStartCoords(coords);
      return;
    }

    if (activeTool === 'table') {
      const newNode: CanvasNodeWithPath = {
        id,
        type: 'shape',
        shapeType: 'table',
        x: coords.x,
        y: coords.y,
        width: 300,
        height: 180,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: maxZ + 1,
        rows: 3,
        cols: 3,
        tableData: [
          ['Header 1', 'Header 2', 'Header 3'],
          ['Data 1', 'Data 2', 'Data 3'],
          ['Data 4', 'Data 5', 'Data 6'],
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addNode(newNode);
      setSelectedNodeIds([id]);
      setActiveTool('select');
      return;
    }

    if (activeTool === 'connector') {
      const clickedNode = findNodeAtCoords(coords);
      const newNode: CanvasNodeWithPath = {
        id,
        type: 'shape',
        shapeType: 'connector',
        startNodeId: clickedNode?.id,
        x: coords.x,
        y: coords.y,
        width: 100,
        height: 100,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: maxZ + 1,
        stroke: '#6366f1',
        strokeWidth: 2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addNode(newNode);
      setActiveDrawingId(id);
      setDrawingStartCoords(coords);
      return;
    }

    // Default Shape Drawing (Rectangle, Circle, Line, Arrow, Text)
    const newNode: CanvasNodeWithPath = {
      id,
      type: 'shape',
      shapeType: activeTool as any,
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: maxZ + 1,
      fill: 'rgba(99, 102, 241, 0.2)',
      stroke: '#6366f1',
      strokeWidth: 2,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    addNode(newNode);
    setActiveDrawingId(id);
    setDrawingStartCoords(coords);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    setMouseScreenPos({ x: e.clientX, y: e.clientY });

    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    if (onCursorMove) {
      onCursorMove(coords);
    }

    if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      panViewport(dx, dy);
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Rotating Logic
    if (rotatingNodeId) {
      const node = nodes[rotatingNodeId];
      if (node) {
        const centerX = node.x + node.width / 2;
        const centerY = node.y + node.height / 2;
        const coords = getCanvasCoordinates(e.clientX, e.clientY);
        const currentAngle = Math.atan2(coords.y - centerY, coords.x - centerX) * (180 / Math.PI);
        const delta = currentAngle - rotateStartAngle;
        const nextRotation = Math.round((nodeInitialRotation + delta + 360) % 360);
        updateNode(rotatingNodeId, { rotation: nextRotation });
      }
      return;
    }

    // Resizing Logic
    if (resizingNodeId && resizeHandle) {
      const dx = (e.clientX - resizeStart.x) / viewport.zoom;
      const dy = (e.clientY - resizeStart.y) / viewport.zoom;

      let newX = resizeStart.nodeX;
      let newY = resizeStart.nodeY;
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      if (resizeHandle.includes('e')) newWidth = Math.max(20, resizeStart.width + dx);
      if (resizeHandle.includes('s')) newHeight = Math.max(20, resizeStart.height + dy);
      if (resizeHandle.includes('w')) {
        const calculatedW = resizeStart.width - dx;
        if (calculatedW > 20) {
          newWidth = calculatedW;
          newX = resizeStart.nodeX + dx;
        }
      }
      if (resizeHandle.includes('n')) {
        const calculatedH = resizeStart.height - dy;
        if (calculatedH > 20) {
          newHeight = calculatedH;
          newY = resizeStart.nodeY + dy;
        }
      }

      updateNode(resizingNodeId, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
      return;
    }

    // Continuous eraser drag point-level deletion with line splitting
    if (activeTool === 'eraser' && e.buttons === 1) {
      eraseAtCoords(coords);
      return;
    }

    // Marquee Selection Drag
    if (marquee) {
      const left = Math.min(drawingStartCoords.x, coords.x);
      const top = Math.min(drawingStartCoords.y, coords.y);
      const width = Math.abs(coords.x - drawingStartCoords.x);
      const height = Math.abs(coords.y - drawingStartCoords.y);
      const nextMarquee = { x: left, y: top, width, height };
      setMarquee(nextMarquee);
      selectNodesInMarquee(nextMarquee);
      return;
    }

    // Dragging Nodes
    if (draggingNodeId) {
      const targetNode = nodes[draggingNodeId];
      if (targetNode) {
        const newX = coords.x - nodeOffset.x;
        const newY = coords.y - nodeOffset.y;
        const dx = newX - targetNode.x;
        const dy = newY - targetNode.y;

        updateNode(draggingNodeId, { x: newX, y: newY });

        // If Frame or Group, move attached children
        if (targetNode.shapeType === 'frame' || targetNode.shapeType === 'group') {
          Object.values(nodes).forEach((child) => {
            if (child.frameId === targetNode.id || child.groupId === targetNode.id) {
              updateNode(child.id, { x: child.x + dx, y: child.y + dy });
            }
          });
        }
      }
      return;
    }

    if (activeDrawingId) {
      const node = nodes[activeDrawingId];
      if (!node) return;

      if (node.shapeType === 'pencil') {
        const nextPoints = [...(node.points || []), coords];
        updateNode(activeDrawingId, { points: nextPoints });
      } else {
        const left = Math.min(drawingStartCoords.x, coords.x);
        const top = Math.min(drawingStartCoords.y, coords.y);
        let width = Math.abs(coords.x - drawingStartCoords.x);
        let height = Math.abs(coords.y - drawingStartCoords.y);

        if (e.shiftKey && (node.shapeType === 'rectangle' || node.shapeType === 'circle')) {
          const side = Math.max(width, height);
          width = side;
          height = side;
        }

        updateNode(activeDrawingId, {
          x: left,
          y: top,
          width,
          height,
        });
      }
    }
  };

  const handlePointerUp = () => {
    if (activeDrawingId) {
      const node = nodes[activeDrawingId];
      if (node) {
        // Single click creation defaults for shapes
        if (node.width < 10 && node.height < 10) {
          if (node.shapeType === 'rectangle') {
            updateNode(activeDrawingId, { width: 120, height: 80 });
          } else if (node.shapeType === 'circle') {
            updateNode(activeDrawingId, { width: 100, height: 100 });
          } else if (node.shapeType === 'line' || node.shapeType === 'arrow') {
            updateNode(activeDrawingId, { width: 100, height: 50 });
          } else if (node.shapeType === 'text') {
            updateNode(activeDrawingId, { width: 160, height: 36 });
          } else if (node.shapeType === 'frame') {
            updateNode(activeDrawingId, { width: 400, height: 300 });
          }
        }

        if (node.shapeType === 'text') {
          setEditingNodeId(activeDrawingId);
        }

        setSelectedNodeIds([activeDrawingId]);
        setActiveTool('select');
      }
    }

    setIsPanning(false);
    setActiveDrawingId(null);
    setDraggingNodeId(null);
    setResizingNodeId(null);
    setResizeHandle(null);
    setRotatingNodeId(null);
    setMarquee(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      zoomViewport(e.deltaY);
    } else {
      panViewport(-e.deltaX, -e.deltaY);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const coords = getCanvasCoordinates(e.clientX, e.clientY);
        handleImageUpload(file, coords);
      }
    }
  };

  const sortedNodes = Object.values(nodes).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => setMouseScreenPos(null)}
      onWheel={handleWheel}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{ cursor: getToolCursorStyle() }}
      className="relative w-full h-full overflow-hidden select-none touch-none"
    >
      {/* Hidden File Input for Image Tool */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
          }
        }}
      />

      {/* Lucide Custom Floating Cursor Follower */}
      {mouseScreenPos && (activeTool === 'eraser' || activeTool === 'pencil') && (
        <div
          style={{
            position: 'fixed',
            left: `${mouseScreenPos.x}px`,
            top: `${mouseScreenPos.y}px`,
            transform: activeTool === 'eraser' ? 'translate(-4px, -20px)' : 'translate(-2px, -22px)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {activeTool === 'eraser' ? (
            <IconEraser className="w-7 h-7 text-red-500 fill-red-500 stroke-white filter drop-shadow-lg" />
          ) : (
            <IconPencil className="w-7 h-7 text-indigo-500 fill-indigo-500 stroke-white filter drop-shadow-lg" />
          )}
        </div>
      )}

      {/* SVG Definitions for Markers */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
          </marker>
        </defs>
      </svg>

      {/* Dynamic Grid */}
      {isGridVisible && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `radial-gradient(var(--canvas-grid) 1.5px, transparent 1.5px)`,
            backgroundSize: `${gridSize * viewport.zoom}px ${gridSize * viewport.zoom}px`,
            backgroundPosition: `${viewport.x}px ${viewport.y}px`,
          }}
        />
      )}

      {/* World Canvas Container */}
      <div
        className="absolute inset-0 pointer-events-none origin-top-left"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
      >
        {/* Remote Live User Cursors */}
        <RemoteCursors cursors={remoteCursors} />

        {/* Marquee Selection Overlay */}
        {marquee && (
          <div
            style={{
              position: 'absolute',
              left: `${marquee.x}px`,
              top: `${marquee.y}px`,
              width: `${marquee.width}px`,
              height: `${marquee.height}px`,
            }}
            className="border border-indigo-500 bg-indigo-500/10 pointer-events-none z-50 rounded-sm"
          />
        )}

        {sortedNodes.map((node) => {
          const isSelected = selectedNodeIds.includes(node.id);

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                height: `${node.height}px`,
                transform: `rotate(${node.rotation || 0}deg)`,
                opacity: node.opacity ?? 1,
                zIndex: node.zIndex || 1,
                pointerEvents: 'auto',
                cursor:
                  activeTool === 'eraser' || activeTool === 'pencil'
                    ? 'none'
                    : activeTool === 'select'
                    ? 'move'
                    : getToolCursorStyle(),
              }}
              className={`group ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-background' : ''}`}
            >
              {/* Frame Container */}
              {node.shapeType === 'frame' && (
                <div
                  className="w-full h-full border-2 border-dashed border-indigo-500/70 rounded-xl p-2 relative bg-indigo-500/5 shadow-sm"
                  style={{
                    backgroundColor: node.fill || 'rgba(99, 102, 241, 0.05)',
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-indigo-600 text-white font-mono text-[11px] font-semibold px-2 py-0.5 rounded-t-md shadow-sm flex items-center gap-1.5">
                    <span>{node.frameTitle || 'Frame'}</span>
                    <span className="opacity-70 text-[9px]">
                      {Math.round(node.width)}x{Math.round(node.height)}
                    </span>
                  </div>
                </div>
              )}

              {/* Sticky Note */}
              {node.shapeType === 'sticky' && (
                <div
                  className="w-full h-full rounded-lg shadow-md p-3 text-slate-900 flex flex-col justify-between"
                  style={{ backgroundColor: node.stickyColor || '#fef08a' }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingNodeId(node.id);
                  }}
                >
                  {editingNodeId === node.id ? (
                    <textarea
                      value={node.text || ''}
                      onChange={(e) => updateNode(node.id, { text: e.target.value })}
                      onBlur={() => setEditingNodeId(null)}
                      className="w-full h-full bg-transparent border-none outline-none font-sans text-sm resize-none"
                      autoFocus
                    />
                  ) : (
                    <span className="font-sans text-sm font-medium whitespace-pre-wrap break-words">
                      {node.text || 'New Sticky Note'}
                    </span>
                  )}
                </div>
              )}

              {/* Uploaded Image */}
              {node.shapeType === 'image' && node.src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={node.src}
                  alt="Canvas Upload"
                  className="w-full h-full object-cover rounded-md shadow-sm border border-border/60 pointer-events-none"
                />
              )}

              {/* Table Grid */}
              {node.shapeType === 'table' && node.tableData && (
                <div className="w-full h-full border border-indigo-500/50 bg-card rounded-md shadow-sm overflow-hidden flex flex-col">
                  {node.tableData.map((row, rIdx) => (
                    <div key={`row-${rIdx}`} className="flex-1 flex border-b border-border/60 last:border-b-0">
                      {row.map((cell, cIdx) => (
                        <div
                          key={`cell-${rIdx}-${cIdx}`}
                          className="flex-1 p-1 border-r border-border/60 last:border-r-0 flex items-center justify-center text-xs font-medium text-center"
                        >
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => {
                              const nextTable = [...node.tableData!];
                              nextTable[rIdx][cIdx] = e.target.value;
                              updateNode(node.id, { tableData: nextTable });
                            }}
                            className="w-full bg-transparent text-center outline-none border-none text-foreground font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Curved Bezier Connector */}
              {node.shapeType === 'connector' && (
                <svg className="w-full h-full overflow-visible">
                  <path
                    d={`M 0 0 C ${node.width / 2} 0, ${node.width / 2} ${node.height}, ${node.width} ${node.height}`}
                    fill="none"
                    stroke={node.stroke || '#6366f1'}
                    strokeWidth={node.strokeWidth || 2}
                    markerEnd="url(#arrowhead)"
                  />
                </svg>
              )}

              {/* Comment Pin */}
              {node.shapeType === 'comment' && (
                <div className="relative">
                  <div
                    className={`w-9 h-9 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
                      node.commentResolved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNodeId(editingNodeId === node.id ? null : node.id);
                    }}
                  >
                    <IconComment className="w-4 h-4" />
                    {(node.commentReplies?.length || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {node.commentReplies?.length}
                      </span>
                    )}
                  </div>

                  {/* Comment Thread Card */}
                  {editingNodeId === node.id && (
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      className="absolute top-10 left-0 w-64 p-3 bg-card border border-border shadow-2xl rounded-xl text-xs space-y-3 z-50"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-1.5 font-semibold">
                        <span>Comment Thread</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 text-[10px]"
                          onClick={() => toggleCommentResolved(node.id)}
                        >
                          {node.commentResolved ? 'Reopen' : 'Resolve'}
                        </Button>
                      </div>

                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {node.commentReplies?.map((r) => (
                          <div key={r.id} className="bg-secondary/40 p-2 rounded-md space-y-0.5">
                            <div className="font-semibold text-indigo-400">{r.author}</div>
                            <div>{r.text}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Write reply..."
                          value={commentReplyText}
                          onChange={(e) => setCommentReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && commentReplyText.trim()) {
                              addCommentReply(node.id, 'User', commentReplyText);
                              setCommentReplyText('');
                            }
                          }}
                          className="flex-1 bg-secondary/60 px-2 py-1 rounded text-xs outline-none border border-border"
                        />
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => {
                            if (commentReplyText.trim()) {
                              addCommentReply(node.id, 'User', commentReplyText);
                              setCommentReplyText('');
                            }
                          }}
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rectangle */}
              {node.shapeType === 'rectangle' && (
                <div
                  className="w-full h-full rounded-md shadow-sm border border-indigo-500/50 flex items-center justify-center p-2 text-center"
                  style={{
                    backgroundColor: node.fill || 'rgba(99, 102, 241, 0.2)',
                    borderColor: node.stroke || '#6366f1',
                    borderWidth: `${node.strokeWidth || 2}px`,
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingNodeId(node.id);
                  }}
                >
                  {editingNodeId === node.id ? (
                    <textarea
                      value={node.text || ''}
                      onChange={(e) => updateNode(node.id, { text: e.target.value })}
                      onBlur={() => setEditingNodeId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          setEditingNodeId(null);
                        }
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="w-full h-full bg-transparent border-none outline-none text-foreground font-sans text-sm text-center resize-none focus:ring-0 p-0"
                      autoFocus
                    />
                  ) : (
                    <span className="w-full truncate text-foreground font-sans text-sm font-medium">
                      {node.text}
                    </span>
                  )}
                </div>
              )}

              {/* Circle */}
              {node.shapeType === 'circle' && (
                <div
                  className="w-full h-full rounded-full shadow-sm border border-indigo-500/50 flex items-center justify-center p-2 text-center"
                  style={{
                    backgroundColor: node.fill || 'rgba(99, 102, 241, 0.2)',
                    borderColor: node.stroke || '#6366f1',
                    borderWidth: `${node.strokeWidth || 2}px`,
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingNodeId(node.id);
                  }}
                >
                  {editingNodeId === node.id ? (
                    <textarea
                      value={node.text || ''}
                      onChange={(e) => updateNode(node.id, { text: e.target.value })}
                      onBlur={() => setEditingNodeId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          setEditingNodeId(null);
                        }
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="w-full h-full bg-transparent border-none outline-none text-foreground font-sans text-sm text-center resize-none focus:ring-0 p-0"
                      autoFocus
                    />
                  ) : (
                    <span className="w-full truncate text-foreground font-sans text-sm font-medium">
                      {node.text}
                    </span>
                  )}
                </div>
              )}

              {/* Line */}
              {node.shapeType === 'line' && (
                <svg className="w-full h-full overflow-visible">
                  <line
                    x1="0"
                    y1="0"
                    x2={node.width}
                    y2={node.height}
                    stroke={node.stroke || '#6366f1'}
                    strokeWidth={node.strokeWidth || 3}
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* Arrow */}
              {node.shapeType === 'arrow' && (
                <svg className="w-full h-full overflow-visible">
                  <line
                    x1="0"
                    y1="0"
                    x2={node.width}
                    y2={node.height}
                    stroke={node.stroke || '#6366f1'}
                    strokeWidth={node.strokeWidth || 3}
                    strokeLinecap="round"
                    markerEnd="url(#arrowhead)"
                  />
                </svg>
              )}

              {/* Clean Borderless Text Node */}
              {node.shapeType === 'text' && (
                <div
                  className="w-full h-full p-1 bg-transparent text-foreground font-sans text-base font-medium flex items-center justify-start select-text overflow-hidden"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingNodeId(node.id);
                  }}
                >
                  {editingNodeId === node.id ? (
                    <textarea
                      value={node.text || ''}
                      onChange={(e) => updateNode(node.id, { text: e.target.value })}
                      onBlur={() => setEditingNodeId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          setEditingNodeId(null);
                        }
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="w-full h-full bg-transparent border-none outline-none text-foreground font-sans text-base text-left resize-none focus:ring-0 p-0"
                      autoFocus
                    />
                  ) : (
                    <span className="w-full h-full whitespace-pre-wrap break-words text-left flex items-center">
                      {node.text || 'Click to edit text'}
                    </span>
                  )}
                </div>
              )}

              {/* Pencil Draw */}
              {node.shapeType === 'pencil' && node.points && node.points.length > 0 && (
                <svg className="w-full h-full overflow-visible">
                  <polyline
                    fill="none"
                    stroke={node.stroke || '#6366f1'}
                    strokeWidth={node.strokeWidth || 3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={node.points.map((p) => `${p.x},${p.y}`).join(' ')}
                  />
                </svg>
              )}

              {/* Rotation Handle Knob when Selected */}
              {isSelected && !node.locked && (
                <div
                  onPointerDown={(e) => startRotating(e, node.id)}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-600 border-2 border-white rounded-full shadow-md cursor-grab active:cursor-grabbing z-30 flex items-center justify-center"
                  title="Rotate Element"
                >
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              )}

              {/* Interactive Resize Handles when Selected */}
              {isSelected && !node.locked && node.shapeType !== 'pencil' && (
                <>
                  <div
                    onPointerDown={(e) => startResizing(e, node.id, 'nw')}
                    className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow cursor-nwse-resize z-30"
                  />
                  <div
                    onPointerDown={(e) => startResizing(e, node.id, 'ne')}
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow cursor-nesw-resize z-30"
                  />
                  <div
                    onPointerDown={(e) => startResizing(e, node.id, 'sw')}
                    className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow cursor-nesw-resize z-30"
                  />
                  <div
                    onPointerDown={(e) => startResizing(e, node.id, 'se')}
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow cursor-nwse-resize z-30"
                  />
                  <div
                    onPointerDown={(e) => startResizing(e, node.id, 'n')}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow cursor-ns-resize z-30"
                  />
                  <div
                    onPointerDown={(e) => startResizing(e, node.id, 's')}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow cursor-ns-resize z-30"
                  />
                  <div
                    onPointerDown={(e) => startResizing(e, node.id, 'w')}
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow cursor-ew-resize z-30"
                  />
                  <div
                    onPointerDown={(e) => startResizing(e, node.id, 'e')}
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow cursor-ew-resize z-30"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
