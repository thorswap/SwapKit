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
        '@cosmos-client/core',
        '@ethersproject/abstract-signer',
        '@ethersproject/bignumber',
        '@ethersproject/bytes',
        '@ethersproject/contracts',
        '@ethersproject/properties',
        '@ethersproject/providers',
        '@ethersproject/transactions',
        '@thorswap-lib/toolbox-cosmos',
        '@thorswap-lib/toolbox-evm',
        '@thorswap-lib/toolbox-utxo',
        'bitcoinjs-lib',
        'coininfo',
        'cosmos-client',
        'crypto',
        'elliptic',
      ],
    },
  },
});

export default viteConfig;
