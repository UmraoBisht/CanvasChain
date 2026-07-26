import { BaseCanvasNode, ViewportTransform } from '@canvas-chain/types';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  viewport: ViewportTransform;
  dpr: number;
}

export abstract class RenderPipeline {
  abstract renderFrame(nodes: BaseCanvasNode[], context: RenderContext): void;
  abstract renderGrid(context: RenderContext, gridSize: number): void;
  abstract renderSelection(selectedNodes: BaseCanvasNode[], context: RenderContext): void;
}

export class DefaultRenderPipeline extends RenderPipeline {
  renderFrame(nodes: BaseCanvasNode[], _context: RenderContext): void {
    // Phase 0 Contract Stub - High level orchestration interface
    nodes.forEach(() => {});
  }

  renderGrid(_context: RenderContext, _gridSize: number): void {
    // Phase 0 Grid Render Contract Stub
  }

  renderSelection(_selectedNodes: BaseCanvasNode[], _context: RenderContext): void {
    // Phase 0 Selection Render Contract Stub
  }
}
