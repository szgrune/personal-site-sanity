// Sanity CDN image-pipeline helpers. Two rules apply to every rendition:
//
//   fit=max      never enlarge past the source. Asking for a width larger than
//                the original otherwise upscales it — which costs bytes for no
//                extra detail, and on an animated GIF multiplies across every
//                frame (the home page's hero was shipping 34MB this way).
//   auto=format  serve WebP/AVIF to browsers that accept it, the original
//                format to those that don't. Animated GIFs become animated
//                WebP with every frame intact, at a fraction of the size.

function withParams(url: string, params: string[]) {
  return `${url}${url.includes("?") ? "&" : "?"}${params.join("&")}`;
}

// Downloads a rendition close to the actual display size instead of the
// full-resolution original. Pass `autoFormat: false` where the delivered file
// type has to stay predictable (e.g. a favicon whose MIME type is declared
// alongside it).
export function sizedImageUrl(
  url: string | null | undefined,
  {
    width,
    quality = 78,
    autoFormat = true,
  }: { width: number; quality?: number; autoFormat?: boolean },
): string | undefined {
  if (!url) return undefined;
  const params = [`w=${width}`, `q=${quality}`, "fit=max"];
  if (autoFormat) params.push("auto=format");
  return withParams(url, params);
}

// Full-size rendition: the original's own dimensions, uncropped and never
// upscaled, just re-encoded. Use where the image is shown at its natural size
// and must not be soft.
export function originalImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return withParams(url, ["auto=format"]);
}

// Work page grid card rendition width. Cards render at 200px tall in a ~3-up
// grid; 700px covers retina displays without shipping the full-resolution
// original. (The list view's hover preview uses originalImageUrl instead, so
// it is never soft at its natural size.)
export const CARD_IMAGE_WIDTH = 700;
