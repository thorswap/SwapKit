import { createRequire } from "module";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(new NodePolyfillPlugin());

      config.plugins.push(
        new webpack.ProvidePlugin({
          global: [require.resolve("global"), "default"],
          process: "process/browser",
        }),
      );

      config.plugins.push(
        new webpack.DefinePlugin({
          "global.crypto": JSON.stringify(require("crypto-browserify")),
          "global.Uint8Array": JSON.stringify(Uint8Array),
          "global.process": "process",
        }),
      );

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: require.resolve("crypto-browserify"),
        process: require.resolve("process/browser"),
      };
    }

    return {
      ...config,
      experiments: {
        ...(config?.experiments || {}),
        syncWebAssembly: true,
      },
    };
  },
};

export default nextConfig;
