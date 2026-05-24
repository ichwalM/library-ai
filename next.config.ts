import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Performance: Image Optimization ───────────────────────────────────────
  images: {
    // Allow remote Google user avatars
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
    // Use modern formats for smaller payloads
    formats: ["image/avif", "image/webp"],
    // Aggressive device size set to reduce unnecessary image variants
    deviceSizes: [640, 768, 1024, 1280, 1920],
  },

  // ─── Performance: Compression ──────────────────────────────────────────────
  compress: true,

  // ─── Performance: Caching Headers ──────────────────────────────────────────
  async headers() {
    return [
      // Static assets: aggressive long-term caching
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Uploaded files: moderate caching
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
      // Fonts: long-term caching
      {
        source: "/:path*\\.(woff|woff2|ttf|otf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Security headers for all routes
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // ─── Performance: Experimental Features ────────────────────────────────────
  experimental: {
    // Optimize CSS delivery (eliminates render-blocking CSS)
    optimizeCss: true,
    // Use partial pre-rendering for better TTFB
    ppr: false,
    // Server components optimization
    serverComponentsHmrCache: true,
    // Increase server action body size limit for large e-book uploads
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // ─── Performance: Server External Packages ─────────────────────────────────
  // These packages are used only server-side; exclude from client bundle
  serverExternalPackages: [
    "pdf-parse",
    "mammoth",
    "@prisma/client",
    "@prisma/adapter-mariadb",
    "mariadb",
  ],


  // ─── Performance: Logging ──────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default nextConfig;
