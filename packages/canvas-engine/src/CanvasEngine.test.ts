import { describe, it, expect, vi } from 'vitest';
import { CanvasEngine } from './CanvasEngine';
import { BaseCanvasNode } from '@canvas-chain/types';

describe('Canvas Engine Lifecycle Architecture', () => {
  it('manages tool states cleanly', () => {
    const engine = new CanvasEngine();
    const spy = vi.fn();
    engine.events.on('tool:change', spy);

    engine.setTool('rectangle');
    expect(engine.getTool()).toBe('rectangle');
    expect(spy).toHaveBeenCalledWith('rectangle');
  });

  it('manages canvas node store and emits events', () => {
    const engine = new CanvasEngine();
    const addSpy = vi.fn();
    engine.events.on('node:add', addSpy);

    const testNode: BaseCanvasNode = {
      id: 'node_1',
      type: 'shape',
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    engine.addNode(testNode);
    expect(engine.getNodes()).toHaveLength(1);
    expect(addSpy).toHaveBeenCalledWith(testNode);

    engine.removeNode('node_1');
    expect(engine.getNodes()).toHaveLength(0);
  });
});
