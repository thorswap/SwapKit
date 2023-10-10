import thorswapViteConfig from '@internal/config';
import { resolve } from 'path';

import { name } from './package.json';

const viteConfig = thorswapViteConfig(name, {
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
    },
  },
  rollupOptions: {
    external: ['@swapkit/helpers', '@swapkit/evm', '@swapkit/utxo', 'bitcoinjs-lib', 'ethers'],
  },
});

export default viteConfig;
