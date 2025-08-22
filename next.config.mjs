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
        {
          protocol: "https",
          hostname: "https://filegilla.s3.us-east-1.amazonaws.com",
          port: "",
          pathname: "**"
        }
      ],
    },
  };
  
  export default nextConfig;
  