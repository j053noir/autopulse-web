import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/components/**/*.{ts,tsx}'],
      exclude: [
        'src/components/**/__tests__/**',
        'src/components/**/*.d.ts',
        'src/components/dashboard/**',
        'src/components/layout/**',
        'src/components/telemetry/**',
      ],
    },
  },
});
