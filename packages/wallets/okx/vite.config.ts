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
        'bitcoinjs-lib',
        'ethers',
        '@swapkit/helpers',
        '@swapkit/toolbox-cosmos',
        '@swapkit/toolbox-evm',
        '@swapkit/toolbox-utxo',
      ],
    },
  },
});

export default viteConfig;
