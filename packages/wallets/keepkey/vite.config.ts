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
    external: [
      '@ethersproject/abstract-signer',
      '@ethersproject/bignumber',
      '@ethersproject/providers',
      '@ethersproject/transactions',
      '@pioneer-platform/toolbox-evm',
      '@pioneer-platform/toolbox-utxo',
      'bitcoinjs-lib',
    ],
  },
});

export default viteConfig;
