/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['coin-images.coingecko.com',
      'static.alchemyapi.io'
    ],
  },
};

export default nextConfig;
