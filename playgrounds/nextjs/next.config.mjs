/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false, path: false };
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
