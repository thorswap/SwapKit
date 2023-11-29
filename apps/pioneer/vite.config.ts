import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';

const isProduction = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  // base: '/',

  // NOTE: Have to be added to fix: Uncaught ReferenceError: process & global is not defined
  define: {
    'process.env': {},
    'process.version': JSON.stringify('v18.16.0'),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@coinmasters/wallet-okx': isProduction
        ? '@coinmasters/wallet-okx'
        : resolve('../../packages/wallets/okx/src'),
      '@coinmasters/wallet-keplr': isProduction
        ? '@coinmasters/wallet-keplr'
        : resolve('../../packages/wallets/keplr/src'),
      '@coinmasters/wallet-metamask': isProduction
        ? '@coinmasters/wallet-metamask'
        : resolve('../../packages/wallets/metamask/src'),
      '@coinmasters/wallet-keystore': isProduction
        ? '@coinmasters/wallet-keystore'
        : resolve('../../packages/wallets/keystore/src'),
      '@coinmasters/wallet-keepkey': isProduction
        ? '@coinmasters/wallet-keepkey'
        : resolve('../../packages/wallets/keepkey/src'),
      '@coinmasters/wallet-ledger': isProduction
        ? '@coinmasters/wallet-ledger'
        : resolve('../../packages/wallets/ledger/src'),
      '@coinmasters/core': isProduction
        ? '@coinmasters/core'
        : resolve('../../packages/swapkit/core/src'),
      '@coinmasters/helpers': isProduction
        ? '@coinmasters/helpers'
        : resolve('../../packages/swapkit/helpers/src'),
      '@coinmasters/tokens': isProduction
        ? '@coinmasters/tokens'
        : resolve('../../packages/swapkit/tokens/src'),
      '@coinmasters/toolbox-cosmos': isProduction
        ? '@coinmasters/toolbox-cosmos'
        : resolve('../../packages/toolboxes/cosmos/src'),
      '@coinmasters/toolbox-evm': isProduction
        ? '@coinmasters/toolbox-evm'
        : resolve('../../packages/toolboxes/evm/src'),
      '@coinmasters/toolbox-utxo': isProduction
        ? '@coinmasters/toolbox-utxo'
        : resolve('../../packages/toolboxes/utxo/src'),
      '@coinmasters/wallet-trezor': isProduction
        ? '@coinmasters/wallet-trezor'
        : resolve('../../packages/wallets/trezor/src'),
      '@coinmasters/types': isProduction
        ? '@coinmasters/types'
        : resolve('../../packages/swapkit/types/src'),
      '@coinmasters/wallet-xdefi': isProduction
        ? '@coinmasters/wallet-xdefi'
        : resolve('../../packages/wallets/xdefi/src'),

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
