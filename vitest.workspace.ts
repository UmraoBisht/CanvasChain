import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    test: {
      name: 'unit',
      include: [
        'packages/**/src/**/*.{test,spec}.{ts,tsx}',
        'services/**/src/**/*.{test,spec}.{ts,tsx}',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/e2e/**',
        'apps/**',
      ],
      environment: 'node',
    },
  },
]);
