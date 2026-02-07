import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "ik.imagekit.io",
  //       port: "",
  //     },
  //   ],
  // },
  //output: "export", // ⬅️ DODAJ TO

  
  
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;