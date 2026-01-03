import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
        'process.env.VITE_CHAT_API_URL': JSON.stringify(env.VITE_CHAT_API_URL),
        'process.env.VITE_PROJECT_API_URL': JSON.stringify(env.VITE_PROJECT_API_URL),
        'process.env.VITE_DOCUMENTS_API_URL': JSON.stringify(env.VITE_DOCUMENTS_API_URL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'markdown-vendor': ['react-markdown', 'remark-gfm'],
              'syntax-highlighter': ['react-syntax-highlighter'],
            },
          },
        },
        chunkSizeWarningLimit: 1000,
        sourcemap: mode === 'development',
        minify: mode === 'production' ? 'terser' : false,
        terserOptions: mode === 'production' ? {
          compress: {
            drop_console: true,
          },
        } : undefined,
      },
    };
});
