import { describe, it, expect } from 'vitest';
import { distance, clamp, snapToGrid, isPointInBoundingBox } from './math';

describe('Canvas Math Utilities', () => {
  it('calculates distance between points', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('clamps values correctly within range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('snaps coordinates to grid scale', () => {
    expect(snapToGrid(17, 10)).toBe(20);
    expect(snapToGrid(14, 10)).toBe(10);
  });

  it('determines if a point is inside bounding box', () => {
    const box = { x: 10, y: 10, width: 100, height: 100 };
    expect(isPointInBoundingBox({ x: 50, y: 50 }, box)).toBe(true);
    expect(isPointInBoundingBox({ x: 0, y: 0 }, box)).toBe(false);
  });
});
