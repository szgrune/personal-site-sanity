const SLIDE_HASH_PATTERN = /^#s(\d+)$/

export function parseSlideHash(hash: string, slideCount: number): number {
  if (slideCount <= 0) return 0

  const match = SLIDE_HASH_PATTERN.exec(hash)
  if (!match) return 0

  const slideNumber = Number.parseInt(match[1], 10)
  if (!Number.isFinite(slideNumber)) return 0

  return Math.min(Math.max(slideNumber - 1, 0), slideCount - 1)
}

export function serializeSlideHash(index: number): string {
  return `#s${Math.max(0, Math.floor(index)) + 1}`
}
