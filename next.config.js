/** @type {import('next').NextConfig} */
const nextConfig = {
  // Matikan eslint saat build (opsional)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Matikan type checking saat build (opsional)
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
