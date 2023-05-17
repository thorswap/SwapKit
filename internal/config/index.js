import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts';
import { builtinModules } from 'module';
import { visualizer } from 'rollup-plugin-visualizer';

const rollupPlugins = [];

/** (name: string) => @type {import('vitest/config').UserConfig} */
const baseConfig = (name) => {
  if (process.env.VITE_ANALYZE) {
    /**
     * bright blue bold italic underline
     */
    console.log('\x1b[1m\x1b[34m\x1b[3m\x1b[4m%s\x1b[0m', 'Vite Analyze Enabled');

    rollupPlugins.push(visualizer({
      emitFile: true,
      sourcemap: true,
      filename: "stats.html",
      title: name,
    }));
  }

return defineConfig({
    base: './',
    plugins: [dts({  clearPureImport: true, rollupTypes: true })],
    build: {
      lib: {
        name,
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'cjs' ? 'cjs' : `${format}.js`}`,
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        external: builtinModules,
        input: 'src/index.ts',
        plugins: rollupPlugins,
        output: {
          inlineDynamicImports: true,
          sourcemap: true,
        },
      },
    },

    test: {
      coverage: {
        provider: 'istanbul'
      }
    },
  })
}

export default (name, /** @type {import('vite').UserConfig} */ config = {}) => mergeConfig(baseConfig(name), config);
