import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['motion-dom'],
  compiler: {
    removeConsole: true,
  },
};

export default nextConfig;
