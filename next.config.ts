import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
    domains: [
      "encrypted-tbn0.gstatic.com",
      "isce-image-uploader.s3.us-east-1.amazonaws.com",
      "i.ytimg.com",
      "hebbkx1anhila5yf.public.blob.vercel-storage.com",
    ], // add the hostname here
  },
};

export default nextConfig;
