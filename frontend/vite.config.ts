/// <reference types="vitest" />
import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    base: "/",
    plugins: [
        react(),
        svgr(),
        viteStaticCopy({
            targets: [
                {
                    src: 'src/assets/logo.svg',
                    dest: 'images'
                },
                {
                    src: 'node_modules/pdfjs-dist/build/pdf.worker.mjs',
                    dest: 'assets/workers',
                    rename: 'pdf.worker.mjs'
                }
            ]
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, 'src/'),
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id: string) { // 💡 Tipado como string
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('scheduler')) {
                            return 'vendor-core';
                        }
                        if (id.includes('@ant-design/icons')) {
                            return 'vendor-icons';
                        }
                        if (id.includes('antd')) {
                            return 'vendor-antd';
                        }
                        if (id.includes('pdfjs-dist') || id.includes('react-pdf')) {
                            return 'vendor-pdf';
                        }
                        if (id.includes('leaflet')) {
                            return 'vendor-leaflet';
                        }
                        return 'vendor-others';
                    }
                },
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/services/__tests__/setup.ts',
        define: {
            'import.meta.env.VITE_BASE_URL': JSON.stringify('http://localhost:3000'),
        },
        testTimeout: 10000, // Increased test timeout
    },
    optimizeDeps: {
        exclude: ['react-router-dom'],
    },
});
