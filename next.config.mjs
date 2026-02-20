/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/py/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/:path*"
            : "https://" + (process.env.VERCEL_URL || "localhost:3000") + "/api/py/:path*",
      },
    ];
  },
};

export default nextConfig;
