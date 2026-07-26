import { ViewportTransform, Point2D } from '@canvas-chain/types';
import { clamp } from '@canvas-chain/utils';

export class ViewportController {
  private viewport: ViewportTransform = { x: 0, y: 0, zoom: 1 };
  private minZoom = 0.1;
  private maxZoom = 5.0;

  constructor(initialViewport?: Partial<ViewportTransform>) {
    if (initialViewport) {
      this.viewport = { ...this.viewport, ...initialViewport };
    }
  }

  getViewport(): ViewportTransform {
    return { ...this.viewport };
  }

  pan(delta: Point2D): ViewportTransform {
    this.viewport.x += delta.x;
    this.viewport.y += delta.y;
    return this.getViewport();
  }

  setZoom(zoom: number, center?: Point2D): ViewportTransform {
    const nextZoom = clamp(zoom, this.minZoom, this.maxZoom);
    if (center) {
      const zoomRatio = nextZoom / this.viewport.zoom;
      this.viewport.x = center.x - (center.x - this.viewport.x) * zoomRatio;
      this.viewport.y = center.y - (center.y - this.viewport.y) * zoomRatio;
    }
    this.viewport.zoom = nextZoom;
    return this.getViewport();
  }

  reset(): ViewportTransform {
    this.viewport = { x: 0, y: 0, zoom: 1 };
    return this.getViewport();
  }
}
