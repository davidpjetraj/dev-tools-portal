import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            // ESM-safe alternative to path.resolve(__dirname, './src')
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 3000,
        proxy: {
            // Forward /v1 requests (REST) to the API
            '/v1': {
                target: 'https://dev-tools-portal.onrender.com',
                changeOrigin: true,
            },
            // Forward /graphql requests to the API during development
            '/graphql': {
                target: 'https://dev-tools-portal.onrender.com',
                changeOrigin: true,
            },

        },
    },
})
