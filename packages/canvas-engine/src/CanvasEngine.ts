import { EventHub } from './EventHub';
import { ViewportController } from './ViewportController';
import { RenderPipeline, DefaultRenderPipeline } from './RenderPipeline';
import { CanvasToolMode, BaseCanvasNode } from '@canvas-chain/types';

export class CanvasEngine {
  public readonly events: EventHub;
  public readonly viewport: ViewportController;
  public readonly renderPipeline: RenderPipeline;

  private activeTool: CanvasToolMode = 'select';
  private nodes: Map<string, BaseCanvasNode> = new Map();

  constructor(pipeline?: RenderPipeline) {
    this.events = new EventHub();
    this.viewport = new ViewportController();
    this.renderPipeline = pipeline || new DefaultRenderPipeline();
  }

  public setTool(tool: CanvasToolMode): void {
    this.activeTool = tool;
    this.events.emit('tool:change', tool);
  }

  public getTool(): CanvasToolMode {
    return this.activeTool;
  }

  public addNode(node: BaseCanvasNode): void {
    this.nodes.set(node.id, node);
    this.events.emit('node:add', node);
  }

  public removeNode(id: string): void {
    if (this.nodes.has(id)) {
      const node = this.nodes.get(id)!;
      this.nodes.delete(id);
      this.events.emit('node:remove', node);
    }
  }

  public getNodes(): BaseCanvasNode[] {
    return Array.from(this.nodes.values());
  }
}
