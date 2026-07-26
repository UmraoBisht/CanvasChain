import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'packages',
      include: ['packages/**/*.{test,spec}.{ts,tsx}', 'services/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
      environment: 'node',
    },
  },
]);
