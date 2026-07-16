import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/37gge",
        destination: "https://37gge.samzgrunebaum.org",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
