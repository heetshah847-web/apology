import { defineConfig, mergeConfig } from 'vite';
import path from 'node:path';
import base from '../../../../../vite.config';

/** Lane 10 harness only: `npx vite --config src/features/phases/distance/demo/vite.demo.config.ts` */
export default mergeConfig(base, defineConfig({
  resolve: { alias: [{ find: /^@\/engine$/, replacement: path.resolve(import.meta.dirname, 'engine-real.ts') }] },
  optimizeDeps: { entries: [path.resolve(import.meta.dirname, 'index.html')] },
}));
