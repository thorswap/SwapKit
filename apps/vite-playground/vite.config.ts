import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // NOTE: Have to be added to fix: Uncaught ReferenceError: process & global is not defined
  define: {
    'process.env': {},
    'process.version': JSON.stringify('v18.16.0'),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@thorswap-lib/keystore': resolve('../../packages/wallets/keystore/src'),
      '@thorswap-lib/ledger': resolve('../../packages/wallets/ledger/src'),
      '@thorswap-lib/swapkit-core': resolve('../../packages/swapkit/swapkit-core/src'),
      '@thorswap-lib/swapkit-entities': resolve('../../packages/swapkit/swapkit-entities/src'),
      '@thorswap-lib/swapkit-explorers': resolve('../../packages/swapkit/swapkit-explorers/src'),
      '@thorswap-lib/toolbox-evm': resolve('../../packages/toolboxes/toolbox-evm/src'),
      '@thorswap-lib/toolbox-cosmos': resolve('../../packages/toolboxes/toolbox-cosmos/src'),
      '@thorswap-lib/toolbox-utxo': resolve('../../packages/toolboxes/toolbox-utxo/src'),
      '@thorswap-lib/types': resolve('../../packages/swapkit/types/src'),
      '@thorswap-lib/trustwallet': resolve('../../packages/wallets/trustwallet/src'),
      '@thorswap-lib/trezor': resolve('../../packages/wallets/trezor/src'),
      '@thorswap-lib/xdefi': resolve('../../packages/wallets/xdefi/src'),

      crypto: resolve('node_modules/crypto-browserify'),
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
      stream: 'readable-stream',
      util: 'util',
      url: 'url',
    },
  },
  server: {
    port: 3000,
  },
  base: '/SwapKit/',

  build: {
    target: 'es2020',
    reportCompressedSize: true,
    sourcemap: true,
    rollupOptions: {
      plugins: [nodePolyfills({ sourceMap: true })],
      output: { sourcemap: true },
    },
  },

  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      // NOTE: Have to be added to fix: Uncaught ReferenceError: global is not defined
      define: { global: 'globalThis' },
    },
  },
});
