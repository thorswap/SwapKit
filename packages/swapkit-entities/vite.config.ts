import thorswapViteConfig from '@internal/config';
import path from 'path';

import packageJson from './package.json';

const viteConfig = thorswapViteConfig(packageJson.name, {
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
    },
    rollupOptions: {
      external: ['bignumber.js', 'tiny-invariant'],
      output: {
        globals: {
          'bignumber.js': 'BigNumber',
          'tiny-invariant': 'invariant',
        },
      },
    },
  },
});

export default viteConfig;
