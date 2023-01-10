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
        '@ethersproject/abstract-signer',
        '@ethersproject/bignumber',
        '@ethersproject/bytes',
        '@ethersproject/contracts',
        '@ethersproject/providers',
        '@thorswap-lib/toolbox-cosmos',
        '@thorswap-lib/toolbox-evm',
        '@thorswap-lib/toolbox-utxo',
      ],
    },
  },
});

export default viteConfig;
