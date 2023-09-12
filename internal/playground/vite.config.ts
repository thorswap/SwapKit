import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  base: '/SwapKit/',

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
      '@thorswap-lib/toolbox-evm': resolve('../../packages/toolboxes/toolbox-evm/src'),
      '@thorswap-lib/toolbox-cosmos': resolve('../../packages/toolboxes/toolbox-cosmos/src'),
      '@thorswap-lib/toolbox-utxo': resolve('../../packages/toolboxes/toolbox-utxo/src'),
      '@thorswap-lib/types': resolve('../../packages/swapkit/types/src'),
      '@thorswap-lib/trezor': resolve('../../packages/wallets/trezor/src'),
      '@thorswap-lib/xdefi': resolve('../../packages/wallets/xdefi/src'),

      events: resolve('./polyfills/events.js'),
      string_decoder: resolve('./polyfills/string_decoder.js'),

      buffer: resolve('node_modules/buffer'),
      crypto: resolve('node_modules/crypto-browserify'),
      http: resolve('node_modules/stream-http'),
      https: resolve('node_modules/https-browserify'),
      os: resolve('node_modules/os-browserify/browser'),
      stream: resolve('node_modules/stream-browserify'),
      util: resolve('node_modules/util'),
      url: resolve('node_modules/url'),
      path: resolve('node_modules/path-browserify'),
      _stream_transform: resolve('node_modules/readable-stream/transform'),
      _stream_readable: resolve('node_modules/readable-stream/readable'),
      _stream_writable: resolve('node_modules/readable-stream/writable'),
      _stream_duplex: resolve('node_modules/readable-stream/duplex'),
      _stream_passthrough: resolve('node_modules/readable-stream/passthrough'),
    },
  },

  build: {
    target: 'es2020',
    reportCompressedSize: true,
    sourcemap: true,
    rollupOptions: {
      plugins: [nodePolyfills()],
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
