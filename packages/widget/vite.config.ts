import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/widget.ts',
      name: 'QueryWingWidget',
      fileName: 'widget',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    target: 'es2015',
    minify: 'terser',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
})
