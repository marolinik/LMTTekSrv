import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false, // Disable source maps in production for smaller bundle
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tabs',
              '@radix-ui/react-accordion',
            ],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Increase limit for large chunks
    },
    // Define environment variables
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL || 'http://localhost:3001/api'),
    },
  };
});
