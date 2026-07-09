import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run 向けに最小構成のサーバをビルド（server.js を standalone 出力）
  output: "standalone",
};

export default nextConfig;
