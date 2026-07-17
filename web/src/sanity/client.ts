import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "f5bbxrks",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-07-13",
  // Next's data cache (revalidate + tags) is the caching layer; the Sanity CDN
  // would only delay webhook-triggered revalidations with its own stale copy.
  useCdn: false,
});
