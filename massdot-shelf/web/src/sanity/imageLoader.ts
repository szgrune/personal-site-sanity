import type {ImageLoaderProps} from 'next/image'

const SANITY_IMAGE_HOST = 'cdn.sanity.io'

export default function sanityImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!src.startsWith('https://')) {
    return src
  }

  const url = new URL(src)

  if (url.hostname !== SANITY_IMAGE_HOST) {
    return src
  }

  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 78))
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', 'max')

  return url.toString()
}
