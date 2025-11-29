/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb"
    }
  },
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "filegilla.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "filegilla-public.s3.amazonaws.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "filegilla-public.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "**",
      },
    ],
  },
  outputFileTracingIncludes: {
    '/**': ['./node_modules/.prisma/client/libquery_engine-*'],
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
