import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Alias @ to the src directory
    },
  },
  // server: {
  //   allowedHosts: true
  // }
  server: {
		port: 5173,
		strictPort: true,
    allowedHosts: true
	},
});
