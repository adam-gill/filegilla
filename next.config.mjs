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
    // async headers() {
    //   return [
    //     {
    //       // Apply headers to all API requests (or other paths as needed)
    //       source: "/:path*", // Matches all paths
    //       headers: [
    //         {
    //           key: "Access-Control-Allow-Origin",
    //           value: "https://filegillablobs.blob.core.windows.net", // Allow this hostname
    //         },
    //         {
    //           key: "Access-Control-Allow-Methods",
    //           value: "GET, POST, OPTIONS", // Add other methods if needed
    //         },
    //       ],
    //     },
    //   ];
    // },
  };
  
  export default nextConfig;
  