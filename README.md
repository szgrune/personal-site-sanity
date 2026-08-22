# personal-site-sanity

Personal portfolio site for Samuel Z. Grunebaum, powered by [Sanity](https://www.sanity.io) as the CMS and a [Next.js](https://nextjs.org) frontend, deployed on Vercel.

This is a CMS-backed rebuild of [szgrune/personal-site](https://github.com/szgrune/personal-site) with the same design: the homepage freeform gallery, the work page project card grid, the about page, the contact page, and individual project pages are all editable in Sanity Studio.

## Structure

```
├── studio/         # Sanity Studio (schemas + editing UI)
├── web/            # Next.js frontend
└── massdot-shelf/  # The MassDOT shelf app, embedded at /massdot
```

- **Sanity project**: `f5bbxrks`, dataset `production`
- **Content model**: `homePage`, `workPage`, `aboutPage`, `siteSettings` (singletons) and `project` documents. Project page bodies are Portable Text with custom `figure`, `imageRow`, `videoFigure`, and `embed` blocks.

## Development

```bash
# frontend (http://localhost:3000)
cd web && npm install && npm run dev

# studio (http://localhost:3333)
cd studio && npm install && npm run dev
```

`web/.env.local` needs:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=f5bbxrks
NEXT_PUBLIC_SANITY_DATASET=production
```

## The MassDOT shelf (`/massdot`)

`massdot-shelf/` is a self-contained Next.js + Sanity app (its own Sanity
project, `3scwu6mf`) that presents the Lab @ MassDOT fellowship work as a
bookshelf. It is *embedded*, not merged: `/massdot` renders the site header and
an iframe filling the rest of the viewport, so browsing shelves and slide decks
never changes the outer URL or unmounts the header.

How it fits together:

- `web/scripts/build-shelf.mjs` runs as `prebuild`, so every `npm run build`
  (and therefore every Vercel deploy) exports the shelf and unpacks it into
  `web/public/massdot-shelf/`. That directory is generated — it is gitignored.
  Shelf content edits in Sanity go live on the next deploy.
- The shelf builds with `basePath`/`assetPrefix` of `/massdot-shelf`, and the
  rewrites in `web/next.config.ts` map its extensionless URLs onto the exported
  `.html` files.
- `web/src/components/ShelfEmbed.tsx` sizes the frame to the space under the
  header and forwards the site's light/dark theme in over `postMessage`; the
  shelf mirrors it onto `<html data-theme>`.
- The `/work` card that links here is the `project-massdot` document, using
  `linkType: external` with the site-relative path `/massdot`.

To rebuild the embed on its own (it does not run during `next dev`):

```bash
cd web && npm run build:shelf
```

To work on the shelf itself, see `massdot-shelf/README.md`; copy
`massdot-shelf/web/.env.example` to `.env.local` first.

**Vercel note:** the build reaches outside the `web/` root directory, so this
project needs *Include source files outside of the Root Directory in the Build
Step* enabled. `build-shelf.mjs` fails loudly if `massdot-shelf/` is missing.

## Deploying

- **Web**: pushes to `main` deploy via Vercel (project root directory is `web/`).
- **Studio**: `cd studio && npx sanity deploy`
- **Schema changes**: edit `studio/schemaTypes/`, then `cd studio && npx sanity schema deploy` so MCP/AI tooling sees the latest schema.

## Content seeding

`scripts/seed.mjs` was used for the one-time migration of content and assets from the original repo. It expects the original repo at `../personal-site` and a `SANITY_WRITE_TOKEN` env var.
