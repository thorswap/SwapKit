import { mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { defineConfig } from 'vitest/config';

const rollupPlugins = [];

// (
//   filePath: string,
//   content: string
// ) => Promise<
//   | void
//   | false
//   | {
//     filePath?: string,
//     content?: string
//   }
// >
const beforeWriteFile = (filePath, content) => {
  content = content.replaceAll('  #private;', '');

  if (content.includes('#private')) {
    console.info('################# Drop file: ', filePath);
    return false;
  }

  return { content, filePath };
};

/** (name: string) => @type {import('vitest/config').UserConfig} */
const baseConfig = (name) =>
  defineConfig({
    base: './',
    plugins: [
      nodePolyfills(),
      dts({ skipDiagnostics: false, clearPureImport: true, rollupTypes: true, beforeWriteFile }),
    ],
    build: {
      lib: {
        name,
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'cjs' ? 'cjs' : `${format}.js`}`,
      },
      commonjsOptions: { transformMixedEsModules: true },
      rollupOptions: {
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
