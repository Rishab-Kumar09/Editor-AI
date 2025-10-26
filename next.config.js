/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone mode for server-based Electron app
  output: 'standalone',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
