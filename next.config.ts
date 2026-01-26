import type { NextConfig } from "next";

function domain(url?: string) { 
  if (!url) return "";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

const API_DOMAINS = [
  process.env.NEXT_PUBLIC_URL,
  process.env.AUTH_BASE_URL,
  process.env.AUTH_LOGIN_PATH,
  process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL,
  process.env.NEXT_PUBLIC_LIVE_ISCEAUTH_BACKEND_URL,
  process.env.NEXT_PUBLIC_LIVE_EVENTS_BACKEND_URL,
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_EVENT_LIVE_URL,
].map(domain).filter(Boolean).join(" ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "fra1.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "isce-image.fra1.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "isce-image-uploader.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
        
        {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
         {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // Prevent clickjacking attacks
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Enable XSS protection (legacy browsers)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer policy - control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions policy - restrict browser features
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=(self), interest-cohort=()",
          },
          // Content Security Policy - prevent XSS and injection attacks
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://*.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              `connect-src 'self' ${API_DOMAINS} https://*.googleapis.com https://maps.googleapis.com https://*.digitaloceanspaces.com https://*.s3.*.amazonaws.com https://cdn.sanity.io https://*.blob.vercel-storage.com"`,
              "frame-src 'self' https://*.google.com https://*.googleapis.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // Strict Transport Security - force HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
