import { notFound } from "next/navigation";

import { client } from "@/sanity/client";
import { PROJECT_QUERY, PROJECT_SLUGS_QUERY } from "@/sanity/queries";
import PortableTextRenderer from "@/components/PortableTextRenderer";

const options = { next: { revalidate: 60, tags: ["sanity"] } };

export async function generateStaticParams() {
  const slugs = await client
    .withConfig({ useCdn: false })
    .fetch<string[]>(PROJECT_SLUGS_QUERY);
  return (slugs ?? []).map((slug) => ({ slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await client.fetch(PROJECT_QUERY, { slug }, options);

  if (!project) return notFound();

  return (
    <div className="project-page">
      <PortableTextRenderer value={project.body} />
    </div>
  );
}
