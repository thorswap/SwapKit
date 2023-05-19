import thorswapViteConfig from '@internal/config';
import { resolve } from 'path';

import { name } from './package.json';

const viteConfig = thorswapViteConfig(name, {
  build: {
    lib: {
      fileName: 'index',
      entry: resolve(__dirname, 'src/index.ts'),
    },
    rollupOptions: {
      external: ['ansi-styles', 'kleur', 'chalk', 'inquirer', 'path'],
    },
  },
});

export default viteConfig;
