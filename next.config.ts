import type { NextConfig } from "next";

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
console.info("[mapbox:build]", {
  tokenExists: Boolean(mapboxToken),
  tokenLength: mapboxToken.length,
  tokenPrefix: mapboxToken ? mapboxToken.slice(0, 8) : "",
  tokenLooksPublic: mapboxToken.startsWith("pk."),
  nodeEnv: process.env.NODE_ENV || "unknown",
});

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dqrpjfdsv/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
