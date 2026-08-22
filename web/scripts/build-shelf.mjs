// Builds the MassDOT shelf app (../massdot-shelf) as a static export and drops
// it into web/public/massdot-shelf/, where /massdot embeds it in an iframe.
//
// Runs as `prebuild`, so every Vercel deploy picks up the shelf's current
// Sanity content. `next dev` never triggers it — run `npm run build:shelf` by
// hand if you want the embed working locally.

import {execFileSync} from 'node:child_process'
import {cpSync, existsSync, rmSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const webDir = dirname(dirname(fileURLToPath(import.meta.url)))
const shelfDir = join(dirname(webDir), 'massdot-shelf')
const shelfWebDir = join(shelfDir, 'web')
const outDir = join(shelfWebDir, 'out')
const destDir = join(webDir, 'public', 'massdot-shelf')

const BASE_PATH = '/massdot-shelf'

// The shelf lives in its own Sanity project, so its ids are pinned here rather
// than read from the ambient environment — on Vercel those NEXT_PUBLIC_SANITY_*
// vars belong to the personal site's project and would silently win.
const shelfEnv = {
  NEXT_PUBLIC_BASE_PATH: BASE_PATH,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.SHELF_SANITY_PROJECT_ID ?? '3scwu6mf',
  NEXT_PUBLIC_SANITY_DATASET: process.env.SHELF_SANITY_DATASET ?? 'production',
  NEXT_PUBLIC_SITE_URL:
    process.env.SHELF_SITE_URL ?? 'https://samzgrunebaum.org/massdot-shelf',
}

if (!existsSync(shelfWebDir)) {
  throw new Error(
    `Cannot build the MassDOT shelf: ${shelfWebDir} is missing.\n` +
      'On Vercel this usually means "Include source files outside of the Root ' +
      'Directory in the Build Step" is turned off for this project.',
  )
}

const run = (args) =>
  execFileSync('npm', args, {
    cwd: shelfDir,
    stdio: 'inherit',
    env: {...process.env, ...shelfEnv},
  })

console.log('[shelf] installing dependencies')
run(['install', '--workspace', 'web', '--no-audit', '--no-fund'])

console.log(`[shelf] building static export at ${BASE_PATH}`)
rmSync(outDir, {recursive: true, force: true})
run(['run', 'build', '--workspace', 'web'])

if (!existsSync(join(outDir, 'index.html'))) {
  throw new Error(`Shelf build produced no index.html in ${outDir}`)
}

console.log(`[shelf] copying export -> ${destDir}`)
rmSync(destDir, {recursive: true, force: true})
cpSync(outDir, destDir, {recursive: true})

console.log('[shelf] done')
