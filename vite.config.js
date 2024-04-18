import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '10.1.7.44',
    port: 8300,
    open: true,
    strictPort: true,
    cors: true,
    hmr: true

  },
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
      formats: ['es', 'iife', 'umd']
    }
  },
})
