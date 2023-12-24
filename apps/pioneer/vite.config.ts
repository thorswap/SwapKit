import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
//import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
// import inject from '@rollup/plugin-inject'
// import wasm from 'vite-plugin-wasm'
const isProduction = true
// @ts-ignore
export default defineConfig(({}) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // const env = loadEnv(mode, process.cwd(), '')
  return {
    // vite config
    define: {
      'process.env.VITE_BLOCKCHAIR_API_KEY': JSON.stringify(process.env.VITE_BLOCKCHAIR_API_KEY),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@coinmasters/pioneer-sdk': isProduction
          ? '@coinmasters/pioneer-sdk'
          : resolve('../../packages/pioneer/pioneer-sdk/src'),
        '@coinmasters/api': isProduction
          ? '@coinmasters/api'
          : resolve('../../packages/swapkit/api/src'),
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
        '@coinmasters/types': isProduction
          ? '@coinmasters/types'
          : resolve('../../packages/swapkit/types/src'),
        routes: resolve(__dirname, 'src/routes'),
        util: 'rollup-plugin-node-polyfills/polyfills/util',
        sys: 'util',
        events: 'rollup-plugin-node-polyfills/polyfills/events',
        //stream: 'rollup-plugin-node-polyfills/polyfills/stream',
        stream: 'stream-browserify',
        path: 'rollup-plugin-node-polyfills/polyfills/path',
        querystring: 'rollup-plugin-node-polyfills/polyfills/qs',
        punycode: 'rollup-plugin-node-polyfills/polyfills/punycode',
        url: 'rollup-plugin-node-polyfills/polyfills/url',
        http: 'rollup-plugin-node-polyfills/polyfills/http',
        https: 'rollup-plugin-node-polyfills/polyfills/http',
        os: 'rollup-plugin-node-polyfills/polyfills/os',
        assert: 'rollup-plugin-node-polyfills/polyfills/assert',
        constants: 'rollup-plugin-node-polyfills/polyfills/constants',
        _stream_duplex:
          'rollup-plugin-node-polyfills/polyfills/readable-stream/duplex',
        _stream_passthrough:
          'rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough',
        _stream_readable:
          'rollup-plugin-node-polyfills/polyfills/readable-stream/readable',
        _stream_writable:
          'rollup-plugin-node-polyfills/polyfills/readable-stream/writable',
        _stream_transform:
          'rollup-plugin-node-polyfills/polyfills/readable-stream/transform',
        timers: 'rollup-plugin-node-polyfills/polyfills/timers',
        console: 'rollup-plugin-node-polyfills/polyfills/console',
        vm: 'rollup-plugin-node-polyfills/polyfills/vm',
        zlib: 'rollup-plugin-node-polyfills/polyfills/zlib',
        tty: 'rollup-plugin-node-polyfills/polyfills/tty',
        domain: 'rollup-plugin-node-polyfills/polyfills/domain'
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis'
        },
        // Enable esbuild polyfill plugins
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true
          }),
          // NodeModulesPolyfillPlugin()
        ],
      }
    },
    build: {
      outDir: "dist",
      minify: false,
      sourcemap: false,
      lib: {
        entry: resolve(__dirname, "src/lib/index.tsx"), // Set the entry file of your library
        name: "PioneerLib", // Set the name of your library
        fileName: (format) => `my-library.${format}.js` // Set the fileName of your library
      },
      rollupOptions: {
        input: {
          main: resolve(__dirname, "src/index.tsx"),
        },
        output: {
          entryFileNames: 'index.js',
          chunkFileNames: 'index_[hash].js',
          assetFileNames: 'index_[hash][extname]',
          format: "es",
          globals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
            '@chakra-ui/react': 'Chakra',
            '@emotion/react': 'emotion'
          }
        },
        external: ['react', 'react-dom', '@chakra-ui/react', '@emotion/react'],
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true
          }),
          rollupNodePolyFill()
        ],
      }
    },
  }
})
