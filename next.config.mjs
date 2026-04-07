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
  /** Local dev: proxy /invoice-api to FastAPI (matches vercel.json). */
  async rewrites() {
    const backend = process.env.BACKEND_PROXY_URL?.trim().replace(/\/+$/, "");
    if (!backend) return [];
    return [{ source: "/invoice-api/:path*", destination: `${backend}/invoice-api/:path*` }];
  },
};

export default withPWA(nextConfig);
