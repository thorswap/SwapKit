import thorswapViteConfig from '@internal/config';
import { resolve } from 'path';

import { name } from './package.json';

const viteConfig = thorswapViteConfig(name, {
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
    },
    rollupOptions: {
      external: [
        '@cosmjs/amino',
        '@cosmjs/encoding',
        '@cosmjs/math',
        '@cosmjs/proto-signing',
        '@cosmjs/stargate',
        '@swapkit/cosmos',
        '@swapkit/evm',
        'cosmjs-types',
        'ethers',
      ],
    },
  },
});

export default viteConfig;
