/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  /**
   * Turbopack Configuration for Next.js 16+
   * Turbopack is enabled by default in Next.js 16
   */
  turbopack: {
    // Enable Turbopack (empty config to silence migration warning)
  },
  
  /**
   * Webpack Configuration for Code Splitting & Tree Shaking
   * DISABLED due to SIGBUS error in production build
   * Using minimal webpack config
   */
  webpack: (config, { isServer }) => {
    // Fix for OpenTelemetry module resolution issue with Bun/Docker
    // Prevent Next.js tracer from loading OpenTelemetry in runtime
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        {
          'next/dist/compiled/@opentelemetry/api': 'next/dist/compiled/@opentelemetry/api',
        },
      ];
    }
    
    return config;
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '19001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '116.118.49.243',
        port: '12007',
        pathname: '/rausach-uploads/**',
      },
      {
        protocol: 'https',
        hostname: '116.118.49.243',
        pathname: '/rausach-uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.rausachtrangia.com',
      },
      {
        protocol: 'http',
        hostname: 'storage.rausachtrangia.com',
      },
      {
        protocol: 'https',
        hostname: 'rausachtrangia.com',
      },
      {
        protocol: 'http',
        hostname: 'rausachtrangia.com',
      },
      {
        protocol: 'https',
        hostname: '*.rausachtrangia.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'minio',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
    // Optimize image loading
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    formats: ['image/avif', 'image/webp'],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql',
    NEXT_PUBLIC_WS_ENDPOINT: process.env.NEXT_PUBLIC_WS_ENDPOINT || 'ws://localhost:3001/graphql',
  },
  
  // Headers for better caching
  headers: async () => [
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
  
  // Redirects and rewrites
  rewrites: async () => ({
    beforeFiles: [],
    afterFiles: [],
    fallback: [],
  }),
  
  // Performance hints
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;
