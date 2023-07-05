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
        '@ethersproject/abstract-signer',
        '@ethersproject/bignumber',
        '@ethersproject/providers',
        '@ethersproject/strings',
        '@thorswap-lib/toolbox-cosmos',
        '@thorswap-lib/toolbox-evm',
        'cosmos-client',
      ],
    },
  },
});

export default viteConfig;
