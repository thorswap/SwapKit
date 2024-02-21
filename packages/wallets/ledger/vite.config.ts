import { resolve } from "path";
import resolveNodeBuildins from "@rollup/plugin-node-resolve";
import sharedViteConfig from "../../../tools/vite";

import { name, peerDependencies } from "./package.json";

const external = Object.keys(peerDependencies);

const viteConfig = sharedViteConfig(name, {
  plugins: [resolveNodeBuildins({ preferBuiltins: true, browser: true })],
  build: {
    lib: { entry: resolve(__dirname, "src/index.ts") },
    rollupOptions: { external },
  },
});
export default viteConfig;
