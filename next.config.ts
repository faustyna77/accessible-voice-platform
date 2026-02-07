import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Wyłącz ESLint podczas buildu
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Wyłącz TypeScript errors podczas buildu
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Obrazy (odkomentuj jeśli potrzebujesz)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
      },
    ],
  },
};

export default nextConfig;