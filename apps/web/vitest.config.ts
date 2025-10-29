import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig(() => {
  return {
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
      setupFiles: ['./tests/setup.ts'],
      env: {
        NODE_ENV: 'test' as const,
      },
      // Run tests sequentially to avoid database conflicts
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    css: {
      postcss: {
        plugins: [],
      },
    },
  };
});
