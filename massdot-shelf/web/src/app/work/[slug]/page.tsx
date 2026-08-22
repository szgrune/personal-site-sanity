import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {cache} from 'react'

import {SlideDeck} from '@/components/SlideDeck'
import {client} from '@/sanity/client'
import {PROJECT_PAGE_QUERY, PROJECT_SLUGS_QUERY} from '@/sanity/queries'

type ProjectPageProps = {
  params: Promise<{slug: string}>
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const getProjectPage = cache((slug: string) => client.fetch(PROJECT_PAGE_QUERY, {slug}))

export const dynamicParams = false

export async function generateStaticParams() {
  const projects = await client.fetch(PROJECT_SLUGS_QUERY)

  return projects.map(({slug}) => ({slug}))
}

export async function generateMetadata({params}: ProjectPageProps): Promise<Metadata> {
  const {slug} = await params
  const {project, settings} = await getProjectPage(slug)

  if (!project) {
    notFound()
  }

  const description =
    project.seoDescription ??
    plainText(project.summary) ??
    `A project from ${settings?.siteTitle ?? 'MassDOT Shelf'}.`
  const canonical = new URL(`/work/${project.slug}`, siteUrl).toString()
  const socialImage =
    project.ogImage?.asset?.url ?? project.coverImage?.asset?.url ?? settings?.ogImage?.asset?.url

  return {
    title: project.title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'article',
      title: project.title,
      description,
      url: canonical,
      siteName: settings?.siteTitle ?? 'MassDOT Shelf',
      images: socialImage ? [{url: socialImage}] : undefined,
    },
  }
}

export default async function ProjectPage({params}: ProjectPageProps) {
  const {slug} = await params
  const {project} = await getProjectPage(slug)

  if (!project) {
    notFound()
  }

  return <SlideDeck project={project} />
}

function plainText(
  blocks:
    | Array<{
        children?: Array<{text?: string}>
      }>
    | null
    | undefined,
): string | null {
  if (!blocks?.length) return null

  const text = blocks
    .map((block) => (block.children ?? []).map((child) => child.text ?? '').join(''))
    .filter(Boolean)
    .join(' ')

  return text || null
}
