import { nodeResolve } from "@rollup/plugin-node-resolve";
import { mergeConfig } from "vite";
import dts from "vite-plugin-dts";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { defineConfig } from "vitest/config";

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
  const modifiedContent = content.replaceAll("  #private;", "");

  if (modifiedContent.includes("#private")) {
    console.info("################# Drop file: ", filePath);
    return false;
  }

  return { content: modifiedContent, filePath };
};

/** (name: string) => @type {import('vitest/config').UserConfig} */
const baseConfig = (name) =>
  defineConfig({
    base: "./",
    plugins: [
      nodePolyfills(),
      dts({ skipDiagnostics: false, clearPureImport: true, rollupTypes: true, beforeWriteFile }),
    ],
    build: {
      sourcemap: true,
      lib: {
        name,
        formats: ["es", "cjs"],
        fileName: (format) => `index.${format === "cjs" ? "cjs" : `${format}.js`}`,
      },
      rollupOptions: {
        input: "src/index.ts",
        plugins: [nodeResolve({ preferBuiltins: false, browser: true })],
        output: ({ format }) => ({
          entryFileNames: ({ name }) => `${name}.${format === "cjs" ? "cjs" : "js"}`,
          preserveModules: false,
          sourcemap: true,
        }),
      },
    },

    test: { coverage: { provider: "istanbul" } },
  });

export default (name, /** @type {import('vite').UserConfig} */ config = {}) =>
  mergeConfig(baseConfig(name), config);
