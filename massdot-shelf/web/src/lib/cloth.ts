export const clothColors = [
  'bay-blue',
  'berkshires-green',
  'duckling-yellow',
  'independence-cranberry',
  'ink',
] as const

export type ClothColor = (typeof clothColors)[number]

type StampColor = '--stamp-on-dark' | '--stamp-on-light'

const stampByCloth: Record<ClothColor, StampColor> = {
  'bay-blue': '--stamp-on-dark',
  'berkshires-green': '--stamp-on-dark',
  'duckling-yellow': '--stamp-on-light',
  'independence-cranberry': '--stamp-on-dark',
  ink: '--stamp-on-dark',
}

export function clothInk(cloth: ClothColor): StampColor {
  return stampByCloth[cloth]
}

export function clothVariable(cloth: ClothColor): `--cloth-${ClothColor}` {
  return `--cloth-${cloth}`
}
