# MassDOT Shelf

A static, Sanity-backed bookshelf portfolio for Summer 2026 work at The Lab @
MassDOT.

> **This app now ships inside samzgrunebaum.org.** It is exported as static HTML
> under the `/massdot-shelf` base path and embedded in an iframe on the
> `/massdot` page of the surrounding repo. The parent `README.md` covers how
> that build and embed work; the notes below still describe the app itself.
>
> Two things follow from being embedded: pages link via `next/link` (so
> `basePath` is applied) with `prefetch={false}` (a static export has no RSC
> payload to prefetch), and `EmbedThemeSync` mirrors the host page's light/dark
> theme onto `<html data-theme>`.

- Sanity Studio: <https://massdot-shelf.sanity.studio>
- Original standalone repo: <https://github.com/szgrune/massdot-shelf>

## Workspaces

- `web/` — Next.js 16 App Router site, exported as static HTML.
- `studio/` — Sanity Studio connected to project `3scwu6mf`, dataset
  `production`.

Install all workspace dependencies from the repository root:

```bash
npm install
```

## Local development

Copy `web/.env.example` to `web/.env.local` (these are public build values,
and only the standalone dev server needs them — the embed build sets its own):

```dotenv
NEXT_PUBLIC_SANITY_PROJECT_ID=3scwu6mf
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Start the website and Studio in separate terminals:

```bash
npm run dev
npm run dev:studio
```

The website runs at <http://localhost:3000> and the Studio at
<http://localhost:3333>.

There are no Sanity read or write tokens in this project. The public dataset is
read without a token. The seed script and Studio deployment use the
authenticated Sanity CLI session at runtime.

## Editing content

Open the Studio and choose:

- **Projects** to edit covers, project metadata, summaries, and ordered slides.
- **Shelves** to add project references and drag them into display order.
- **Site Settings** to edit the global introduction, links, default social
  image, and favicon.

To add a project:

1. Create and publish a document under **Projects**.
2. Set a unique slug and add at least one slide.
3. Open the relevant document under **Shelves**.
4. Add the project reference to **Items**, drag it into position, and publish
   the shelf.

Published content is captured at build time. In production, the Sanity webhook
triggers a new Vercel build after a relevant document is published.

The seed is idempotent but uses `createOrReplace`, so do not run it after
replacing the provisional content unless resetting all seeded documents is
intentional:

```bash
cd studio
npx sanity exec scripts/seed.mjs --with-user-token
```

Never add a `SANITY_WRITE_TOKEN` variable or write a Sanity token to a file.

## Assets

The shelf texture lives at `web/public/textures/walnut.webp`. Replace that one
file while keeping the filename. A CSS wood-grain gradient remains beneath the
image so a missing file never leaves a transparent shelf.

Keep the texture web-sized before deployment. The current file is approximately
38 MB and should be compressed for production performance.

## Checks and builds

Run from the repository root:

```bash
npm run typegen
npm run lint
npm run test
npm run build --workspace web
```

The static website is emitted to `web/out/`. The Studio can be checked
independently with:

```bash
npm run build --workspace studio
```

## Vercel deployment

The Vercel project is `massdot-shelf-web` under Samuel Grunebaum's projects.
It is connected to `szgrune/massdot-shelf`, with:

- **Root Directory:** `web`
- **Framework Preset:** Next.js
- **Production Branch:** `main`
- **Production URL:** <https://massdot-shelf-web-coral.vercel.app>

In Vercel, open **massdot-shelf-web → Settings → Environment Variables** and
set these for Production and Preview:

```dotenv
NEXT_PUBLIC_SANITY_PROJECT_ID=3scwu6mf
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SITE_URL=https://massdot-shelf-web-coral.vercel.app
```

These values are public build configuration, not secrets. Changing any
`NEXT_PUBLIC_*` value requires a new deployment because Next.js embeds it at
build time.

Pushes to `main` deploy automatically through the GitHub integration. A manual
production deployment can also be created from the repository root with:

```bash
vercel --prod
```

## Sanity Studio deployment

The hosted Studio is registered as application `odu9h2cz63vchmhqx1cbpcah`.
Deploy updates from `studio/`:

```bash
cd studio
npx sanity deploy --yes --schema-required
```

The production website origin is allowed in Sanity without credentials. To
review CORS in the browser, open **sanity.io/manage → MassDOT Shelf → Settings
→ API settings → CORS Origins**. The configured origins are:

- `http://localhost:3000`
- `http://localhost:3333`
- `https://massdot-shelf-web-coral.vercel.app`

## Publish-to-deploy webhook

The deploy hook URL is a sensitive capability: anyone with it can trigger a
build. Never commit it or put it in an environment file.

Create the receiving hook in Vercel:

1. Open **massdot-shelf-web → Settings → Git**.
2. Scroll to **Deploy Hooks**.
3. Enter `Sanity Publish` as the name and select `main`.
4. Click **Create Hook** and copy the generated URL.

Connect it in Sanity:

1. Open **sanity.io/manage → MassDOT Shelf → Settings → API → Webhooks**.
2. Create a webhook named `Vercel production rebuild`.
3. Paste the Vercel deploy-hook URL.
4. Select dataset `production`.
5. Enable **Create**, **Update**, and **Delete**.
6. Set the filter to:

   ```groq
   _type in ["project", "shelf", "siteSettings"]
   ```

7. Leave drafts and versions disabled.
8. Set the HTTP method to `POST` and save.

Test the connection by publishing a harmless edit in Studio. Vercel should show
a deployment marked as triggered by a Deploy Hook. The Sanity webhook's
three-dot menu opens its attempts log if delivery needs debugging.
