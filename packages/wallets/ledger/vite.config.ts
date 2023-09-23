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
        '@scure/base',
        '@thorswap-lib/swapkit-helpers',
        '@thorswap-lib/toolbox-cosmos',
        '@thorswap-lib/toolbox-evm',
        '@thorswap-lib/toolbox-utxo',
        'bchaddrjs',
        '@scure/base',
        'bitcoinjs-lib',
        'bn.js',
        'coininfo',
        'cosmjs-types',
        'crypto-js',
        'elliptic',
        'ethers',
      ],
    },
  },
});

export default viteConfig;
