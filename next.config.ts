import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* https://prompt-image-1257969197.picbj.myqcloud.com/midjourney/000d26c9-69fc-40c2-8274-48957584da7f.jpeg/jpg_75*/
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'prompt-image-1257969197.picbj.myqcloud.com',
        pathname: '/midjourney/**',
      },
    ],
  },
};

export default nextConfig;
