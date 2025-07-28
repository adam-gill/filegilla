/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "filegillablobs.blob.core.windows.net",
          port: "",
          pathname: "**",
        },
      ],
    },
  };
  
  export default nextConfig;
  