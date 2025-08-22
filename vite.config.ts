import vue from '@vitejs/plugin-vue';
import laravel from 'laravel-vite-plugin';
import vuetify from 'vite-plugin-vuetify'
import { defineConfig } from 'vite';

export default defineConfig({
    resolve: {
        alias: {
            crypto: 'crypto-browserify',
        },
    },
    plugins: [
        laravel({
            input: ['resources/js/app.ts'],
            ssr: 'resources/js/ssr.ts',
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        vuetify({ autoImport: true }),

    ],
});
