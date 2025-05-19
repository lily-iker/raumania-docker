/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'res.cloudinary.com',
      'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      'fimgs.net',
      'theme.hstatic.net',
      'product.hstatic.net',
    ],
  },
}

module.exports = nextConfig
