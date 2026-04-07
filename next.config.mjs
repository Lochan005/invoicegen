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
  /**
   * Local dev only: proxy /invoice-api to uvicorn.
   * In production (Vercel build), rewrites must stay empty so /invoice-api is handled by
   * vercel.json → api/server.py. If BACKEND_PROXY_URL is set on Vercel, a rewrite would try
   * 127.0.0.1:8000 inside the cloud and return HTTP 500 HTML.
   */
  async rewrites() {
    if (process.env.NODE_ENV === "production") return [];
    const backend = process.env.BACKEND_PROXY_URL?.trim().replace(/\/+$/, "");
    if (!backend) return [];
    return [{ source: "/invoice-api/:path*", destination: `${backend}/invoice-api/:path*` }];
  },
};

export default withPWA(nextConfig);
