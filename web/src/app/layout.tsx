import type { Metadata } from "next";
import "./globals.css";

import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { sizedImageUrl } from "@/sanity/imageUrl";
import ThemeRegistry from "@/components/ThemeRegistry";
import type { SiteSettings } from "@/components/Header";

const options = { next: { revalidate: 60 } };

export async function generateMetadata(): Promise<Metadata> {
  const settings = ((await client.fetch(SITE_SETTINGS_QUERY, {}, options)) ?? {}) as SiteSettings;

  // Favicon comes from Site Settings in the Studio; fall back to the static
  // /favicon.ico in public/ when none is set.
  const icon = settings.faviconUrl
    ? {
        url: sizedImageUrl(settings.faviconUrl, { width: 64, quality: 90 }) ?? settings.faviconUrl,
        type: settings.faviconMimeType ?? undefined,
      }
    : { url: "/favicon.ico" };

  return {
    title: "Samuel Z. Grunebaum",
    description: "Samuel Z. Grunebaum – designer, developer, educator",
    icons: { icon: [icon] },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = ((await client.fetch(SITE_SETTINGS_QUERY, {}, options)) ?? {}) as SiteSettings;

  return (
    <html lang="en">
      <body>
        <ThemeRegistry settings={settings}>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
