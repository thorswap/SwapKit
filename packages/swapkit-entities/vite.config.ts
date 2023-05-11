import thorswapViteConfig from '@internal/config';
import { resolve } from 'path';

import { name } from './package.json';

const viteConfig = thorswapViteConfig(name, {
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
    },
    rollupOptions: {
      external: ['bignumber.js'],
      output: {
        globals: {
          'bignumber.js': 'BigNumber',
          'tiny-invariant': 'invariant',
        },
      },
    },
  },
});

export default viteConfig;
