import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Admin saves send whole sections (e.g. every blog post) in one request.
    serverActions: { bodySizeLimit: "5mb" },
  },
  images: {
    // Images uploaded through the admin when the site runs on Vercel Blob storage.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    formats: ["image/avif", "image/webp"],
    // 85 for site photography (see Picture), 75 for small admin thumbnails.
    qualities: [75, 85],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: "/:dir(images|videos|brand)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
