/**
 * Replaces the Willa Cosinuke card's animated GIF with a 1.5x-speed
 * re-encode (see scripts note below for the ffmpeg command used).
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=<token> node scripts/replace-willa-gif.mjs <path-to-gif>
 */

import fs from "node:fs";
import { createClient } from "@sanity/client";

const token = process.env.SANITY_WRITE_TOKEN;
const filePath = process.argv[2];
if (!token || !filePath) {
  console.error("Usage: SANITY_WRITE_TOKEN=<token> node scripts/replace-willa-gif.mjs <path-to-gif>");
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
  console.log("Uploading re-encoded GIF...");
  const asset = await client.assets.upload("image", fs.createReadStream(filePath), {
    filename: "willa_gif_1.5x.gif",
  });
  console.log("Uploaded:", asset._id, asset.url);

  await client
    .patch("project-willa")
    .set({ cardImage: { _type: "image", asset: { _type: "reference", _ref: asset._id } } })
    .commit();

  console.log("Patched project-willa.cardImage to the new asset.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
