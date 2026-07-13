/**
 * Adds the initial category list to the work page and assigns tags to each
 * project based on its content. Safe to re-run (uses set, not append).
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=<token> node scripts/add-tags.mjs
 */

import { createClient } from "@sanity/client";

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error("Missing SANITY_WRITE_TOKEN");
  process.exit(1);
}

const client = createClient({
  projectId: "f5bbxrks",
  dataset: "production",
  apiVersion: "2026-07-13",
  token,
  useCdn: false,
});

const BASE_CATEGORIES = [
  "Front End",
  "Full Stack",
  "AI",
  "UX Design",
  "Data Visualization",
  "UX Research",
  "Teaching",
  "Art",
];

// Assigned from each project page's content; to be reviewed in the Studio.
const PROJECT_TAGS = {
  "project-kimino": ["UX Design", "Front End"],
  "project-openlibrary": ["UX Design", "Front End", "Full Stack"],
  "project-infotopia": ["Data Visualization", "Front End", "Art"],
  "project-biobuoy": ["Art"],
  "project-urbancowboy": ["UX Design", "Front End"],
  "project-willa": ["Art", "Front End"],
  "project-noranormile": ["UX Design", "Front End", "Art"],
  "project-meanwhile": ["UX Design", "UX Research"],
  "project-wcma": ["UX Research", "UX Design"],
};

async function main() {
  let tx = client.transaction();
  tx = tx.patch("workPage", (p) => p.set({ categories: BASE_CATEGORIES }));
  for (const [id, tags] of Object.entries(PROJECT_TAGS)) {
    tx = tx.patch(id, (p) => p.set({ tags }));
  }
  await tx.commit();
  console.log(
    `Set ${BASE_CATEGORIES.length} base categories and tags on ${Object.keys(PROJECT_TAGS).length} projects.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
