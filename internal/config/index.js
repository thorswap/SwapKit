import { builtinModules } from 'module';
import { mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

const rollupPlugins = [];

/** (name: string) => @type {import('vitest/config').UserConfig} */
const baseConfig = (name) =>
  defineConfig({
    base: './',
    plugins: [dts({ clearPureImport: true, rollupTypes: true })],
    build: {
      lib: {
        name,
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'cjs' ? 'cjs' : `${format}.js`}`,
      },
      commonjsOptions: { transformMixedEsModules: true },
      rollupOptions: {
        external: builtinModules,
        input: 'src/index.ts',
        plugins: rollupPlugins,
        output: ({ format }) => ({
          entryFileNames: ({ name }) => `${name}.${format === 'cjs' ? 'cjs' : 'js'}`,
          preserveModules: false,
          sourcemap: true,
        }),
      },
    },

    test: { coverage: { provider: 'istanbul' } },
  });

export default (name, /** @type {import('vite').UserConfig} */ config = {}) =>
  mergeConfig(baseConfig(name), config);
