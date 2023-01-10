import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts';
import { builtinModules } from 'module';

/** (name: string) => @type {import('vitest/config').UserConfig} */
const baseConfig = (name) => defineConfig({
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
      output: {
        inlineDynamicImports: true,
        sourcemap: true,
      },
    },
  },

  test: {

  },
});

export default (name, /** @type {import('vite').UserConfig} */ config = {}) => mergeConfig(baseConfig(name), config);
