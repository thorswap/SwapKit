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
        '@scure/bip39',
        '@swapkit/helpers',
        '@swapkit/cosmos',
        '@swapkit/evm',
        '@swapkit/utxo',
        'ethers',
        'bitcoinjs-lib',
      ],
    },
  },
});

export default viteConfig;
