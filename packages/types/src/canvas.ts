export type CanvasToolMode =
  | 'select'
  | 'pan'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'text'
  | 'pencil'
  | 'eraser'
  | 'frame'
  | 'sticky'
  | 'image'
  | 'table'
  | 'connector'
  | 'comment';

export type CanvasShapeType =
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'text'
  | 'pencil'
  | 'frame'
  | 'sticky'
  | 'image'
  | 'table'
  | 'connector'
  | 'group'
  | 'comment';

export interface Point2D {
  x: number;
  y: number;
}

export interface Size2D {
  width: number;
  height: number;
}

export interface ViewportTransform {
  x: number;
  y: number;
  zoom: number;
}

export interface BoundingBox extends Point2D, Size2D {}

export type CanvasNodeType = 'shape' | 'text' | 'path' | 'group' | 'frame' | 'comment';

export interface CommentReply {
  id: string;
  author: string;
  text: string;
  createdAt: number;
}

export interface BaseCanvasNode {
  id: string;
  type: CanvasNodeType;
  shapeType?: CanvasShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  shadow?: boolean;
  zIndex: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  points?: Point2D[];
  
  // Phase 2 Extensions
  src?: string; // Image URL or Base64 data
  stickyColor?: string; // Sticky note color swatch
  frameTitle?: string; // Frame header label
  groupId?: string; // Parent group ID
  frameId?: string; // Parent frame ID
  childNodeIds?: string[]; // Children inside Frame or Group
  
  // Connectors
  startNodeId?: string;
  endNodeId?: string;
  cp1?: Point2D; // Bezier control point 1
  cp2?: Point2D; // Bezier control point 2

  // Tables
  tableData?: string[][]; // Tabular cell matrix
  rows?: number;
  cols?: number;

  // Comments
  commentAuthor?: string;
  commentResolved?: boolean;
  commentReplies?: CommentReply[];

  createdAt: number;
  updatedAt: number;
}

export interface CanvasState {
  nodes: Record<string, BaseCanvasNode>;
  selectedNodeIds: string[];
  viewport: ViewportTransform;
  activeTool: CanvasToolMode;
  isGridVisible: boolean;
  isSnapToGridEnabled: boolean;
  gridSize: number;
}
