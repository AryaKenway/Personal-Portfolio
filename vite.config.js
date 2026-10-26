import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const rootDirectory = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    base: '/Personal-Portfolio/',
    plugins: [react(), tailwindcss()],
    build: {
        rollupOptions: {
            input: {
                home: resolve(rootDirectory, 'index.html')
            }
        }
    }
});