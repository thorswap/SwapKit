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
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@swapkit/api': resolve('../../packages/swapkit/api/src'),
      '@swapkit/core': resolve('../../packages/swapkit/core/src'),
      '@swapkit/chainflip': resolve('../../packages/swapkit/chainflip/src'),
      '@swapkit/helpers': resolve('../../packages/swapkit/helpers/src'),
      '@swapkit/tokens': resolve('../../packages/swapkit/tokens/src'),
      '@swapkit/types': resolve('../../packages/swapkit/types/src'),

      '@swapkit/toolbox-cosmos': resolve('../../packages/toolboxes/cosmos/src'),
      '@swapkit/toolbox-evm': resolve('../../packages/toolboxes/evm/src'),
      '@swapkit/toolbox-utxo': resolve('../../packages/toolboxes/utxo/src'),

      '@swapkit/wallet-evm-extensions': resolve('../../packages/wallets/evm-extensions/src'),
      '@swapkit/wallet-keplr': resolve('../../packages/wallets/keplr/src'),
      '@swapkit/wallet-keepkey': resolve('../../packages/wallets/keepkey/src'),
      '@swapkit/wallet-keystore': resolve('../../packages/wallets/keystore/src'),
      '@swapkit/wallet-ledger': resolve('../../packages/wallets/ledger/src'),
      '@swapkit/wallet-okx': resolve('../../packages/wallets/okx/src'),
      '@swapkit/wallet-trezor': resolve('../../packages/wallets/trezor/src'),
      '@swapkit/wallet-wc': resolve('../../packages/wallets/wc/src'),
      '@swapkit/wallet-xdefi': resolve('../../packages/wallets/xdefi/src'),

      events: resolve('./polyfills/events.js'),
      string_decoder: resolve('./polyfills/string_decoder.js'),

      buffer: resolve('node_modules/buffer'),
      crypto: resolve('node_modules/crypto-browserify'),
      http: resolve('node_modules/stream-http'),
      https: resolve('node_modules/https-browserify'),
      os: resolve('node_modules/os-browserify/browser'),
      stream: resolve('node_modules/stream-browserify'),
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
