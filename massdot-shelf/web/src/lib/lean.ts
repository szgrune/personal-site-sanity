const MIN_LEAN = -1.5
const LEAN_RANGE = 3

export function leanFor(seed: string): number {
  let hash = 2166136261

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  const normalized = (hash >>> 0) / 0xffffffff
  return Number((MIN_LEAN + normalized * LEAN_RANGE).toFixed(3))
}
