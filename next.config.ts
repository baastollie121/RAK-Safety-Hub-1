
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Remove these for production - they ignore important errors
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  
  // Enable strict mode for better React development
  reactStrictMode: true,

  // External packages for server components
  serverExternalPackages: ['jspdf', 'html2canvas'],
  
  // Optimize images
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
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      },
      // Add Firebase Storage for your safety documents
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      // Add other image sources as needed
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile images
        port: '',
        pathname: '/**',
      },
    ],
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Enable experimental features for better performance
  experimental: {
    // Use the correct property for your Next.js version
    
    // Optimize package imports
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'recharts',
    ],
  },
  
  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Webpack configuration for better bundle optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          radix: {
            test: /[\/]node_modules[\/]@radix-ui[\/]/,
            name: 'radix',
            priority: 10,
          },
          vendor: {
            test: /[\/]node_modules[\/]/,
            name: 'vendor',
            priority: 5,
          },
        },
      };
    }
    
    return config;
  },
  
  // Environment variables that should be available to the client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: false,
      },
    ];
  },
  
  // Enable logging for debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // Add trailing slash for better compatibility
  trailingSlash: false,
  
  // Ensure proper asset prefix for Firebase hosting
  assetPrefix: '',
  
  // Configure base path if your app is in a subdirectory
  // basePath: '',
};

export default nextConfig;
