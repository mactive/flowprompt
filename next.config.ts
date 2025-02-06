import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'prompt-image-1257969197.cos.ap-beijing.myqcloud.com',
        pathname: '/midjourney/**',
      },
    ],
  },
};

export default nextConfig;
