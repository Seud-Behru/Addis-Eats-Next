/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // next/image only optimizes remote photos from hosts we list here.
  // These are exactly the hosts used in data/menu-data.json.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
