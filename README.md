# personal-site-sanity

Personal portfolio site for Samuel Z. Grunebaum, powered by [Sanity](https://www.sanity.io) as the CMS and a [Next.js](https://nextjs.org) frontend, deployed on Vercel.

This is a CMS-backed rebuild of [szgrune/personal-site](https://github.com/szgrune/personal-site) with the same design: the homepage freeform gallery, the work page project card grid, the about page, the contact page, and individual project pages are all editable in Sanity Studio.

## Structure

```
├── studio/   # Sanity Studio (schemas + editing UI)
└── web/      # Next.js frontend
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

## Deploying

- **Web**: pushes to `main` deploy via Vercel (project root directory is `web/`).
- **Studio**: `cd studio && npx sanity deploy`
- **Schema changes**: edit `studio/schemaTypes/`, then `cd studio && npx sanity schema deploy` so MCP/AI tooling sees the latest schema.

## Content seeding

`scripts/seed.mjs` was used for the one-time migration of content and assets from the original repo. It expects the original repo at `../personal-site` and a `SANITY_WRITE_TOKEN` env var.
