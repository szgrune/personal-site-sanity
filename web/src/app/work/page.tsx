import { client } from "@/sanity/client";
import { WORK_PAGE_QUERY } from "@/sanity/queries";
import WorkView from "@/components/WorkView";
import { type ProjectCard } from "@/components/WorkGrid";

const options = { next: { revalidate: 60, tags: ["sanity"] } };

export const metadata = {
  title: "Samuel Z. Grunebaum",
};

export default async function WorkPage() {
  const workPage = await client.fetch(WORK_PAGE_QUERY, {}, options);

  return (
    <WorkView
      tagline={workPage?.tagline}
      categories={workPage?.categories}
      projects={(workPage?.projects ?? []) as ProjectCard[]}
    />
  );
}
