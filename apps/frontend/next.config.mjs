/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      // أضف نطاقات الصور الأخرى التي تستخدمها هنا
    ],
  },
};

export default nextConfig;
