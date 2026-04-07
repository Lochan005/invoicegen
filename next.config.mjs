import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** Local dev: proxy /api to FastAPI so `next dev` can reach the same routes as Vercel. */
  async rewrites() {
    const backend = process.env.BACKEND_PROXY_URL?.trim().replace(/\/+$/, "");
    if (!backend) return [];
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};

export default withPWA(nextConfig);
