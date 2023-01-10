import thorswapViteConfig from '@internal/config';
import path from 'path';

import packageJson from './package.json';

const viteConfig = thorswapViteConfig(packageJson.name, {
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
    },
    rollupOptions: {
      external: [
        '@binance-chain/javascript-sdk',
        '@cosmos-client/core',
        '@ethersproject/abstract-signer',
        '@ethersproject/bignumber',
        '@ethersproject/contracts',
        '@ethersproject/bytes',
        '@ethersproject/properties',
        '@ethersproject/providers',
        '@ethersproject/transactions',
        '@thorswap-lib/toolbox-cosmos',
        '@thorswap-lib/toolbox-evm',
        '@thorswap-lib/toolbox-utxo',
        'crypto',
        'bech32',
        'cosmos-client',
        'bitcoinjs-lib',
        'bn.js',
        'coininfo',
      ],
    },
  },
});

export default viteConfig;
