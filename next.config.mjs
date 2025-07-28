/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // CORS headers for Safe App integration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Allow all origins for Safe Apps
          },
        ],
      },
    ];
  },
};

export default nextConfig;
