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
  allowedDevOrigins: [
    'https://*.csb.app', // Allow any subdomain of csb.app over HTTPS
    // You can add other specific origins if needed, e.g., 'http://localhost:3000'
  ],
};

export default nextConfig;
