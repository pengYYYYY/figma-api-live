import path from 'path';

import { defineConfig } from 'vite';
import createVuePlugin from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config/
export default ({ mode }) => {
  return defineConfig({
    base: mode === 'development' ? '' : 'figma-api-live',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3001,
    },
    plugins: [createVuePlugin(), vueJsx(), svgLoader()],
  });
};
