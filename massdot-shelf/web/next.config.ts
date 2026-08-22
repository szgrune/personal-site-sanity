import type {NextConfig} from 'next'

// The shelf ships as a static export mounted inside samzgrunebaum.org at
// /massdot-shelf/, where the personal site embeds it in an iframe. Everything
// the app links to or loads has to carry that prefix, hence basePath +
// assetPrefix. Overridable so the app can still be built standalone.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const nextConfig: NextConfig = {
  output: 'export',
  // No trailing slashes: the host site normalizes them away, and a
  // mismatch costs a 308 on every page load plus an aborted RSC prefetch.
  trailingSlash: false,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: {
    loader: 'custom',
    loaderFile: './src/sanity/imageLoader.ts',
  },
}

export default nextConfig
