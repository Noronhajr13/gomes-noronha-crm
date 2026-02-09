/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'orcnbzjdjezqddwkeyxl.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // CORS é tratado pelo middleware.ts com suporte a múltiplas origens
}

module.exports = nextConfig
