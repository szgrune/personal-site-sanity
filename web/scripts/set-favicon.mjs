/**
 * Uploads a favicon image and sets it on the siteSettings document.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=<token> node scripts/set-favicon.mjs <path-to-image>
 */
import fs from "node:fs";
import path from "node:path";

import { createClient } from "@sanity/client";

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error("Missing SANITY_WRITE_TOKEN");
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath || !fs.existsSync(filePath)) {
  console.error("Usage: node scripts/set-favicon.mjs <path-to-image>");
  process.exit(1);
}

const client = createClient({
  projectId: "f5bbxrks",
  dataset: "production",
  apiVersion: "2026-07-13",
  token,
  useCdn: false,
});

async function main() {
  const asset = await client.assets.upload("image", fs.createReadStream(filePath), {
    filename: path.basename(filePath),
  });
  console.log("Uploaded asset:", asset._id);

  const settings = await client.fetch(`*[_type == "siteSettings"][0]._id`);
  if (!settings) {
    console.error("No siteSettings document found");
    process.exit(1);
  }

  await client
    .patch(settings)
    .set({
      favicon: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      },
    })
    .commit();
  console.log("Patched", settings, "with favicon");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
