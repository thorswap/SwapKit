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
        '@swapkit/helpers',
        '@swapkit/toolbox-cosmos',
        '@swapkit/toolbox-evm',
        '@swapkit/toolbox-utxo',
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
