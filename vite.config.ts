import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
        // Add explicit conditions for module resolution
        conditions: ['import', 'module', 'browser', 'default']
      },
      optimizeDeps: {
        include: ['react', 'react-dom']
      },
      server: {
        port: 3000,
        proxy: {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
          }
        }
      }
    };
});
