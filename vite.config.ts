import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild', // Faster and very efficient
    sourcemap: false,
    cssMinify: true,
    reportCompressedSize: false, // Save build time
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'framer-motion': ['framer-motion'],
        }
      }
    },
    chunkSizeWarningLimit: 500
  },
  esbuild: {
    legalComments: 'none', // Remove comments for smaller bundle
    drop: ['console', 'debugger'], // Remove potential debug code
  }
})
