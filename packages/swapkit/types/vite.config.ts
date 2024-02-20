import { resolve } from "path";
import sharedViteConfig from "../../../tools/vite";

import { name } from "./package.json";

const viteConfig = sharedViteConfig(name, {
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
    },
  },
});

export default viteConfig;
