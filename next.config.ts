
import type {NextConfig} from 'next';
import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: './.env' });

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // The `env` key is automatically populated by Next.js with variables prefixed with NEXT_PUBLIC_.
  // We just need to make sure they are loaded into the process, which `dotenv.config()` does.
};

export default nextConfig;
