import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "images.thegreatestbooks.org",
        port: "",
        pathname: "/**", // Allow any path for this hostname
      },
    ],
  },
};

export default nextConfig;
