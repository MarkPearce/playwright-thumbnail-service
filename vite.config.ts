import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    ssr: true,
    rollupOptions: {
      input: 'src/ssr/entry.tsx'
    }
  },
  ssr: {
    noExternal: ['react', 'react-dom']
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
