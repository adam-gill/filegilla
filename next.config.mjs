/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "filegilla.s3.us-east-1.amazonaws.com",
          port: "",
          pathname: "**"
        }
      ],
    },
  };
  
  export default nextConfig;
  