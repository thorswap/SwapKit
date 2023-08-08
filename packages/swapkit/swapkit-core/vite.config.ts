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
        '@thorswap-lib/toolbox-evm',
        '@thorswap-lib/toolbox-cosmos',
        '@thorswap-lib/toolbox-utxo',
        'typeforce',
      ],
    },
  },
});

export default viteConfig;
