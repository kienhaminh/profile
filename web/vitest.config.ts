import { defineConfig } from 'vitest/config';
import path from 'path';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode || 'test', process.cwd(), '');

  return {
    test: {
      environment: 'node',
      globals: true,
      include: ['tests/**/*.test.ts'],
      env,
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
