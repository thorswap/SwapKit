import thorswapViteConfig from '@internal/config';
import resolveNodeBuildins from '@rollup/plugin-node-resolve';
import { resolve } from 'path';

import { name, peerDependencies } from './package.json';

const external = Object.keys(peerDependencies);

const viteConfig = thorswapViteConfig(name, {
  plugins: [resolveNodeBuildins({ preferBuiltins: true, browser: true })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
    },
    rollupOptions: {
      external,
    },
  },
});
export default viteConfig;
