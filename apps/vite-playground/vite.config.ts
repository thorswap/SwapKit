import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // NOTE: Have to be added to fix: Uncaught ReferenceError: process is not defined
  define: {
    'process.env': {},
  },
  plugins: [react()],
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
      stream: 'readable-stream',
      util: 'util',
      url: 'url',

      '@thorswap-lib/keystore': resolve('../../packages/keystore/src'),
      '@thorswap-lib/ledger': resolve('../../packages/ledger/src'),
      '@thorswap-lib/swapkit-core': resolve('../../packages/swapkit-core/src'),
      '@thorswap-lib/swapkit-entities': resolve('../../packages/swapkit-entities/src'),
      '@thorswap-lib/swapkit-explorers': resolve('../../packages/swapkit-explorers/src'),
      '@thorswap-lib/toolbox-evm': resolve('../../packages/toolbox-evm/src'),
      '@thorswap-lib/toolbox-cosmos': resolve('../../packages/toolbox-cosmos/src'),
      '@thorswap-lib/toolbox-utxo': resolve('../../packages/toolbox-utxo/src'),
      '@thorswap-lib/types': resolve('../../packages/types/src'),
      '@thorswap-lib/trustwallet': resolve('../../packages/trustwallet/src'),
      '@thorswap-lib/trezor': resolve('../../packages/trezor/src'),
      '@thorswap-lib/walletconnect': resolve('../../packages/walletconnect/src'),
      '@thorswap-lib/web-extensions': resolve('../../packages/web-extensions/src'),
    },
  },
  server: {
    port: 3000,
  },

  // NOTE: Have to be added to fix: Uncaught ReferenceError: global is not defined
  optimizeDeps: {
    esbuildOptions: {
      define: { global: 'globalThis' },
    },
  },
});
