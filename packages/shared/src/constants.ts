import { ViewportTransform } from '@canvas-chain/types';

export const DEFAULT_GRID_SIZE = 20;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5.0;
export const DEFAULT_ZOOM = 1.0;

export const DEFAULT_VIEWPORT: ViewportTransform = {
  x: 0,
  y: 0,
  zoom: DEFAULT_ZOOM,
};

export const APP_NAME = 'Canvas Chain';
export const APP_VERSION = '0.1.0';
