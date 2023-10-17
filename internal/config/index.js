import { builtinModules } from 'module';
import { mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';
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
    console.log('################# Drop file: ', filePath);
    return false;
  }

  return { content, filePath };
};

/** (name: string) => @type {import('vitest/config').UserConfig} */
const baseConfig = (name, external) =>
  defineConfig({
    base: './',
    plugins: [
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
        external,
        input: 'src/index.ts',
        plugins: rollupPlugins,
        output: ({ format }) => ({
          external: builtinModules,
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
