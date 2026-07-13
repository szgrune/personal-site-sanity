import type { Metadata } from "next";
import "./globals.css";

import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import ThemeRegistry from "@/components/ThemeRegistry";
import type { SiteSettings } from "@/components/Header";

export const metadata: Metadata = {
  title: "Samuel Z. Grunebaum",
  description: "Samuel Z. Grunebaum – designer, developer, educator",
};

const options = { next: { revalidate: 60 } };

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
