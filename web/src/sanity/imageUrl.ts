// Appends Sanity CDN image-pipeline params to an asset URL so the browser
// downloads a rendition close to its actual display size instead of the
// full-resolution original (Sanity resizes on the fly, including animated
// GIFs, which keeps all frames while shrinking the file).
export function sizedImageUrl(
  url: string | null | undefined,
  { width, quality = 78 }: { width: number; quality?: number },
): string | undefined {
  if (!url) return undefined;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}w=${width}&q=${quality}`;
}
