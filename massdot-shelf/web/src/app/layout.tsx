import type {Metadata} from 'next'
import localFont from 'next/font/local'
import {Noto_Sans} from 'next/font/google'

import {EmbedThemeSync} from '@/components/EmbedThemeSync'
import {client} from '@/sanity/client'
import {SITE_METADATA_QUERY} from '@/sanity/queries'

import './globals.css'

const deAetna = localFont({
  src: '../../public/fonts/DeAetna-Subhead.woff2',
  variable: '--font-deaetna',
  display: 'swap',
})

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-noto-sans',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export async function generateMetadata(): Promise<Metadata> {
  const settings = await client.fetch(SITE_METADATA_QUERY)
  const siteTitle = settings?.siteTitle ?? 'MassDOT Shelf'
  const description =
    settings?.tagline ??
    'Summer 2026 work from The Lab at the Massachusetts Department of Transportation.'
  const socialImage = settings?.ogImage?.asset?.url
  const favicon = settings?.favicon?.asset

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteTitle,
      template: `%s · ${siteTitle}`,
    },
    description,
    alternates: {
      canonical: '/',
    },
    icons: {
      icon: favicon?.url
        ? [{url: favicon.url, type: favicon.mimeType ?? undefined}]
        : [{url: `${basePath}/favicon.svg`, type: 'image/svg+xml'}],
    },
    openGraph: {
      type: 'website',
      title: siteTitle,
      description,
      url: siteUrl,
      siteName: siteTitle,
      images: socialImage ? [{url: socialImage}] : undefined,
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${deAetna.variable} ${notoSans.variable}`}>
      <body>
        <EmbedThemeSync />
        {children}
      </body>
    </html>
  )
}
