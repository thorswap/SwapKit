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
        '@ethersproject/abstract-provider',
        '@ethersproject/contracts',
        '@ethersproject/providers',
        '@ethersproject/units',
        '@thorswap-lib/toolbox-evm',
        'typeforce',
      ],
    },
  },
});

export default viteConfig;
