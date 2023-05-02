import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/public',
  },
  // path aliases
  resolve: {
    alias: {
      '@providers': '/src/providers',
      '@components': '/src/components',
      '@assets': '/src/assets',
      '@src': '/src',
    },
  },
});
