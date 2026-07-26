import { create } from 'zustand';
import { CanvasState, CanvasToolMode, ViewportTransform, BaseCanvasNode, BoundingBox } from '@canvas-chain/types';
import { DEFAULT_VIEWPORT } from '@canvas-chain/shared';
import { clamp, generateId } from '@canvas-chain/utils';

export interface CanvasNodeWithPath extends BaseCanvasNode {}

const MAX_HISTORY = 50;
const SYNC_CHANNEL_KEY = 'canvas_chain_realtime_sync_v1';

let realTimeChannel: BroadcastChannel | null = null;
let lastStateBroadcastTime = 0;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  realTimeChannel = new BroadcastChannel(SYNC_CHANNEL_KEY);
}

const broadcastStateUpdate = (nodes: Record<string, CanvasNodeWithPath>) => {
  const now = Date.now();
  if (now - lastStateBroadcastTime < 40) return;
  lastStateBroadcastTime = now;

  if (realTimeChannel) {
    try {
      realTimeChannel.postMessage({ type: 'STATE_SYNC', nodes });
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'STATE_SYNC', nodes, user: { id: 'store-sync' } }),
    }).catch(() => {});
  }
};

interface CanvasStoreState extends CanvasState {
  nodes: Record<string, CanvasNodeWithPath>;
  past: Record<string, CanvasNodeWithPath>[];
  future: Record<string, CanvasNodeWithPath>[];
  clipboard: CanvasNodeWithPath[];

  // Actions
  setActiveTool: (tool: CanvasToolMode) => void;
  setViewport: (viewport: ViewportTransform) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;

  addNode: (node: CanvasNodeWithPath) => void;
  updateNode: (id: string, updates: Partial<CanvasNodeWithPath>) => void;
  updateSelectedNodes: (updates: Partial<CanvasNodeWithPath>) => void;
  removeNode: (id: string) => void;
  deleteSelected: () => void;

  setSelectedNodeIds: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  selectNodesInMarquee: (marquee: BoundingBox) => void;

  panViewport: (dx: number, dy: number) => void;
  zoomViewport: (delta: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // History Actions
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Clipboard & Duplicate
  copySelected: () => void;
  pasteClipboard: () => void;
  duplicateSelected: () => void;

  // Layer Ordering
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  toggleLockSelected: () => void;

  // Grouping Actions
  groupSelected: () => void;
  ungroupSelected: () => void;

  // Alignment & Distribution
  alignSelected: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeSelected: (axis: 'horizontal' | 'vertical') => void;

  // Comments
  addCommentReply: (nodeId: string, author: string, text: string) => void;
  toggleCommentResolved: (nodeId: string) => void;

  // Bulk Load / Restore
  loadWorkspaceState: (nodes: Record<string, CanvasNodeWithPath>) => void;
}

export const useCanvasStore = create<CanvasStoreState>((set, get) => {
  if (typeof window !== 'undefined') {
    if (realTimeChannel) {
      realTimeChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_SYNC' && event.data.nodes) {
          set({ nodes: event.data.nodes });
        }
      };
    }

    // SSE Cross-Browser Node Sync Listener
    const eventSource = new EventSource('/api/sync');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type === 'STATE_SYNC' && data.nodes && data.user?.id !== 'store-sync-self') {
          set({ nodes: data.nodes });
        }
      } catch (e) {}
    };
  }

  return {
    nodes: {},
    selectedNodeIds: [],
    viewport: DEFAULT_VIEWPORT,
    activeTool: 'select',
    isGridVisible: true,
    isSnapToGridEnabled: true,
    gridSize: 20,
    past: [],
    future: [],
    clipboard: [],

    setActiveTool: (activeTool) => set({ activeTool }),
    setViewport: (viewport) => set({ viewport }),
    toggleGrid: () => set((state) => ({ isGridVisible: !state.isGridVisible })),
    toggleSnapToGrid: () => set((state) => ({ isSnapToGridEnabled: !state.isSnapToGridEnabled })),

    commitHistory: () => {
      const { nodes, past } = get();
      const nextPast = [...past, JSON.parse(JSON.stringify(nodes))].slice(-MAX_HISTORY);
      set({ past: nextPast, future: [] });
    },

    undo: () => {
      const { past, nodes, future } = get();
      if (past.length === 0) return;

      const previousNodes = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      const newFuture = [JSON.parse(JSON.stringify(nodes)), ...future];

      set({
        nodes: previousNodes,
        past: newPast,
        future: newFuture,
        selectedNodeIds: [],
      });
      broadcastStateUpdate(previousNodes);
    },

    redo: () => {
      const { future, nodes, past } = get();
      if (future.length === 0) return;

      const nextNodes = future[0];
      const newFuture = future.slice(1);
      const newPast = [...past, JSON.parse(JSON.stringify(nodes))];

      set({
        nodes: nextNodes,
        past: newPast,
        future: newFuture,
        selectedNodeIds: [],
      });
      broadcastStateUpdate(nextNodes);
    },

    addNode: (node) => {
      get().commitHistory();
      const nextNodes = { ...get().nodes, [node.id]: node };
      set({
        nodes: nextNodes,
        selectedNodeIds: [node.id],
      });
      broadcastStateUpdate(nextNodes);
    },

    updateNode: (id, updates) => {
      const existing = get().nodes[id];
      if (!existing || existing.locked) return;
      const nextNodes = {
        ...get().nodes,
        [id]: { ...existing, ...updates, updatedAt: Date.now() },
      };
      set({ nodes: nextNodes });
      broadcastStateUpdate(nextNodes);
    },

    updateSelectedNodes: (updates) => {
      get().commitHistory();
      const nextNodes = { ...get().nodes };
      get().selectedNodeIds.forEach((id) => {
        if (nextNodes[id] && !nextNodes[id].locked) {
          nextNodes[id] = { ...nextNodes[id], ...updates, updatedAt: Date.now() };
        }
      });
      set({ nodes: nextNodes });
      broadcastStateUpdate(nextNodes);
    },

    removeNode: (id) => {
      get().commitHistory();
      const next = { ...get().nodes };
      delete next[id];
      set({
        nodes: next,
        selectedNodeIds: get().selectedNodeIds.filter((nodeId) => nodeId !== id),
      });
      broadcastStateUpdate(next);
    },

    deleteSelected: () => {
      get().commitHistory();
      const nextNodes = { ...get().nodes };
      get().selectedNodeIds.forEach((id) => {
        delete nextNodes[id];
      });
      set({
        nodes: nextNodes,
        selectedNodeIds: [],
      });
      broadcastStateUpdate(nextNodes);
    },

    setSelectedNodeIds: (selectedNodeIds) => set({ selectedNodeIds }),
    clearSelection: () => set({ selectedNodeIds: [] }),

    selectAll: () =>
      set((state) => ({
        selectedNodeIds: Object.keys(state.nodes),
      })),

    selectNodesInMarquee: (marquee) =>
      set((state) => {
        const selected = Object.values(state.nodes)
          .filter((node) => {
            const intersects =
              node.x < marquee.x + marquee.width &&
              node.x + node.width > marquee.x &&
              node.y < marquee.y + marquee.height &&
              node.y + node.height > marquee.y;
            return intersects;
          })
          .map((node) => node.id);

        return { selectedNodeIds: selected };
      }),

    panViewport: (dx, dy) =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          x: state.viewport.x + dx,
          y: state.viewport.y + dy,
        },
      })),

    zoomViewport: (delta) =>
      set((state) => {
        const nextZoom = clamp(state.viewport.zoom * (1 - delta * 0.001), 0.2, 4.0);
        return {
          viewport: {
            ...state.viewport,
            zoom: nextZoom,
          },
        };
      }),

    zoomIn: () =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: clamp(state.viewport.zoom * 1.2, 0.2, 5.0),
        },
      })),

    zoomOut: () =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: clamp(state.viewport.zoom / 1.2, 0.2, 5.0),
        },
      })),

    resetZoom: () =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: 1.0,
          x: 0,
          y: 0,
        },
      })),

    copySelected: () => {
      const { nodes, selectedNodeIds } = get();
      const selected = selectedNodeIds.map((id) => nodes[id]).filter(Boolean);
      set({ clipboard: JSON.parse(JSON.stringify(selected)) });
    },

    pasteClipboard: () => {
      const { clipboard, nodes } = get();
      if (clipboard.length === 0) return;
      get().commitHistory();

      const newNodes = { ...nodes };
      const newSelectedIds: string[] = [];

      clipboard.forEach((item) => {
        const newId = generateId(item.shapeType || 'shape');
        const pastedItem: CanvasNodeWithPath = {
          ...JSON.parse(JSON.stringify(item)),
          id: newId,
          x: item.x + 20,
          y: item.y + 20,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        newNodes[newId] = pastedItem;
        newSelectedIds.push(newId);
      });

      set({ nodes: newNodes, selectedNodeIds: newSelectedIds });
      broadcastStateUpdate(newNodes);
    },

    duplicateSelected: () => {
      get().copySelected();
      get().pasteClipboard();
    },

    bringToFront: (id) => {
      get().commitHistory();
      const maxZ = Math.max(0, ...Object.values(get().nodes).map((n) => n.zIndex || 0));
      const target = get().nodes[id];
      if (!target) return;
      const nextNodes = {
        ...get().nodes,
        [id]: { ...target, zIndex: maxZ + 1 },
      };
      set({ nodes: nextNodes });
      broadcastStateUpdate(nextNodes);
    },

    sendToBack: (id) => {
      get().commitHistory();
      const minZ = Math.min(0, ...Object.values(get().nodes).map((n) => n.zIndex || 0));
      const target = get().nodes[id];
      if (!target) return;
      const nextNodes = {
        ...get().nodes,
        [id]: { ...target, zIndex: minZ - 1 },
      };
      set({ nodes: nextNodes });
      broadcastStateUpdate(nextNodes);
    },

    moveUp: (id) => {
      const target = get().nodes[id];
      if (!target) return;
      const nextNodes = {
        ...get().nodes,
        [id]: { ...target, zIndex: (target.zIndex || 0) + 1 },
      };
      set({ nodes: nextNodes });
      broadcastStateUpdate(nextNodes);
    },

    moveDown: (id) => {
      const target = get().nodes[id];
      if (!target) return;
      const nextNodes = {
        ...get().nodes,
        [id]: { ...target, zIndex: (target.zIndex || 0) - 1 },
      };
      set({ nodes: nextNodes });
      broadcastStateUpdate(nextNodes);
    },

    toggleLockSelected: () => {
      get().commitHistory();
      const nextNodes = { ...get().nodes };
      get().selectedNodeIds.forEach((id) => {
        if (nextNodes[id]) {
          nextNodes[id] = {
            ...nextNodes[id],
            locked: !nextNodes[id].locked,
          };
        }
      });
      set({ nodes: nextNodes });
      broadcastStateUpdate(nextNodes);
    },

    // Grouping
    groupSelected: () => {
      const { selectedNodeIds, nodes } = get();
      if (selectedNodeIds.length < 2) return;
      get().commitHistory();

      const selected = selectedNodeIds.map((id) => nodes[id]).filter(Boolean);
      const minX = Math.min(...selected.map((n) => n.x));
      const minY = Math.min(...selected.map((n) => n.y));
      const maxX = Math.max(...selected.map((n) => n.x + n.width));
      const maxY = Math.max(...selected.map((n) => n.y + n.height));

      const groupId = generateId('group');
      const maxZ = Math.max(0, ...Object.values(nodes).map((n) => n.zIndex || 0));

      const groupNode: CanvasNodeWithPath = {
        id: groupId,
        type: 'group',
        shapeType: 'group',
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: maxZ + 1,
        childNodeIds: selectedNodeIds,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updatedNodes = { ...nodes, [groupId]: groupNode };
      selectedNodeIds.forEach((id) => {
        if (updatedNodes[id]) {
          updatedNodes[id] = { ...updatedNodes[id], groupId };
        }
      });

      set({ nodes: updatedNodes, selectedNodeIds: [groupId] });
      broadcastStateUpdate(updatedNodes);
    },

    ungroupSelected: () => {
      const { selectedNodeIds, nodes } = get();
      if (selectedNodeIds.length === 0) return;
      get().commitHistory();

      const nextNodes = { ...nodes };
      const newSelected: string[] = [];

      selectedNodeIds.forEach((id) => {
        const target = nextNodes[id];
        if (target && target.shapeType === 'group' && target.childNodeIds) {
          target.childNodeIds.forEach((childId) => {
            if (nextNodes[childId]) {
              nextNodes[childId] = { ...nextNodes[childId], groupId: undefined };
              newSelected.push(childId);
            }
          });
          delete nextNodes[id];
        }
      });

      set({ nodes: nextNodes, selectedNodeIds: newSelected });
      broadcastStateUpdate(nextNodes);
    },

    // Alignment & Distribution
    alignSelected: (alignment) => {
      const { selectedNodeIds, nodes } = get();
      if (selectedNodeIds.length < 2) return;
      get().commitHistory();

      const selected = selectedNodeIds.map((id) => nodes[id]).filter((n) => n && !n.locked);
      if (selected.length < 2) return;

      const minX = Math.min(...selected.map((n) => n.x));
      const minY = Math.min(...selected.map((n) => n.y));
      const maxX = Math.max(...selected.map((n) => n.x + n.width));
      const maxY = Math.max(...selected.map((n) => n.y + n.height));
      const centerX = minX + (maxX - minX) / 2;
      const centerY = minY + (maxY - minY) / 2;

      const nextNodes = { ...nodes };
      selected.forEach((n) => {
        let newX = n.x;
        let newY = n.y;

        if (alignment === 'left') newX = minX;
        else if (alignment === 'center') newX = centerX - n.width / 2;
        else if (alignment === 'right') newX = maxX - n.width;
        else if (alignment === 'top') newY = minY;
        else if (alignment === 'middle') newY = centerY - n.height / 2;
        else if (alignment === 'bottom') newY = maxY - n.height;

        nextNodes[n.id] = { ...n, x: newX, y: newY, updatedAt: Date.now() };
      });

      set({ nodes: nextNodes });
      broadcastStateUpdate(nextNodes);
    },

    distributeSelected: (axis) => {
      const { selectedNodeIds, nodes } = get();
      if (selectedNodeIds.length < 3) return;
      get().commitHistory();

      const selected = selectedNodeIds.map((id) => nodes[id]).filter((n) => n && !n.locked);
      if (selected.length < 3) return;

      const nextNodes = { ...nodes };

      if (axis === 'horizontal') {
        const sorted = [...selected].sort((a, b) => a.x - b.x);
        const minX = sorted[0].x;
        const maxX = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width;
        const totalWidths = sorted.reduce((sum, n) => sum + n.width, 0);
        const gap = (maxX - minX - totalWidths) / (sorted.length - 1);

        let currentX = minX;
        sorted.forEach((n) => {
          nextNodes[n.id] = { ...n, x: currentX, updatedAt: Date.now() };
          currentX += n.width + gap;
        });
      } else {
        const sorted = [...selected].sort((a, b) => a.y - b.y);
        const minY = sorted[0].y;
        const maxY = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height;
        const totalHeights = sorted.reduce((sum, n) => sum + n.height, 0);
        const gap = (maxY - minY - totalHeights) / (sorted.length - 1);

        let currentY = minY;
        sorted.forEach((n) => {
          nextNodes[n.id] = { ...n, y: currentY, updatedAt: Date.now() };
          currentY += n.height + gap;
        });
      }

      set({ nodes: nextNodes });
      broadcastStateUpdate(nextNodes);
    },

    // Comments
    addCommentReply: (nodeId, author, text) => {
      const node = get().nodes[nodeId];
      if (!node) return;
      const replies = node.commentReplies || [];
      const newReply = {
        id: generateId('reply'),
        author,
        text,
        createdAt: Date.now(),
      };

      const nextNodes = {
        ...get().nodes,
        [nodeId]: {
          ...node,
          commentReplies: [...replies, newReply],
          updatedAt: Date.now(),
        },
      };

      set({ nodes: nextNodes });
      broadcastStateUpdate(nextNodes);
    },

    toggleCommentResolved: (nodeId) => {
      const node = get().nodes[nodeId];
      if (!node) return;
      const nextNodes = {
        ...get().nodes,
        [nodeId]: {
          ...node,
          commentResolved: !node.commentResolved,
          updatedAt: Date.now(),
        },
      };

      set({ nodes: nextNodes });
      broadcastStateUpdate(nextNodes);
    },

    loadWorkspaceState: (nodes) => {
      set({ nodes, selectedNodeIds: [], past: [], future: [] });
      broadcastStateUpdate(nodes);
    },
  };
});
