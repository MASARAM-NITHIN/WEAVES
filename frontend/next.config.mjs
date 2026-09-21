/** @type {import('next').NextConfig} */

// Internal backend address (server-to-server). Read at runtime by `next start`,
// so it can differ between local dev and hosting (e.g. Replit) without rebuilding.
const BACKEND_INTERNAL_URL = (process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async rewrites() {
    return {
      // afterFiles: Next.js serves its own routes/static files first
      // (/api/admin-upload, /api/admin-counts, /uploads/* in public/),
      // everything else under /api and /uploads is proxied to Spring Boot.
      // This lets the whole app run behind a SINGLE public port.
      afterFiles: [
        { source: '/api/:path*', destination: `${BACKEND_INTERNAL_URL}/api/:path*` },
        { source: '/uploads/:path*', destination: `${BACKEND_INTERNAL_URL}/uploads/:path*` },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
        ],
      },
    ];
  },
};
export default nextConfig;
