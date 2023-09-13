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
        '@cosmjs/crypto',
        '@cosmjs/encoding',
        '@cosmjs/math',
        '@cosmjs/proto-signing',
        '@cosmjs/stargate',
        '@ethersproject/abstract-signer',
        '@ethersproject/bignumber',
        '@ethersproject/bytes',
        '@ethersproject/properties',
        '@ethersproject/providers',
        '@ethersproject/transactions',
        '@thorswap-lib/toolbox-cosmos',
        '@thorswap-lib/toolbox-evm',
        '@thorswap-lib/toolbox-utxo',
        '@types/bchaddrjs',
        'base64-js',
        'bchaddrjs',
        '@scure/base',
        'bitcoinjs-lib',
        'bn.js',
        'coininfo',
        'cosmjs-types',
        'crypto-js',
        'elliptic',
        'long',
      ],
    },
  },
});

export default viteConfig;
