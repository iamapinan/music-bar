/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  compress: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/t/:tenantSlug",
        destination: "/play/:tenantSlug",
        permanent: true,
      },
      {
        source: "/t/:tenantSlug/:path*",
        destination: "/play/:tenantSlug/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
