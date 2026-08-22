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
  // The MassDOT shelf is a static Next export unpacked into
  // public/massdot-shelf/, where each page is a bare `.html` file. Serving out
  // of public/ won't add that extension on its own, so these rewrites do. They
  // run after the filesystem check, which is what keeps them from touching the
  // real files alongside the pages (_next assets, textures, fonts, RSC .txt).
  async rewrites() {
    return [
      { source: "/massdot-shelf", destination: "/massdot-shelf/index.html" },
      // The export names every route's RSC payload `<route>.txt`, except the
      // shelf root's, which it writes as index.txt inside the directory.
      { source: "/massdot-shelf.txt", destination: "/massdot-shelf/index.txt" },
      {
        source: "/massdot-shelf/:path*",
        destination: "/massdot-shelf/:path*.html",
      },
    ];
  },
};

export default nextConfig;
