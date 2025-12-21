import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components/index.ts'),
      '@constants': path.resolve(__dirname, 'src/constants/index.ts'),
      '@pages': path.resolve(__dirname, 'src/pages/index.ts'),
      '@queries': path.resolve(__dirname, 'src/queries/index.ts'),
      '@routes': path.resolve(__dirname, 'src/routes/index.ts'),
      '@services': path.resolve(__dirname, 'src/services/index.ts'),
      '@stores': path.resolve(__dirname, 'src/stores/index.ts'),
      '@styles': path.resolve(__dirname, 'src/styles/index.ts'),
      '@types': path.resolve(__dirname, 'src/types/index.ts'),
      '@utils': path.resolve(__dirname, 'src/utils/index.ts'),
    },
  },
  server: {
    port: 7001,
    strictPort: true,
    open: false,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
