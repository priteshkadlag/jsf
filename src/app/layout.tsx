import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontCss, fontVariables } from "./fonts";
import { getContent } from "@/lib/cms/content";
import { ogImage } from "@/lib/cms/seo";
import { COLOR_KEYS } from "@/lib/cms/types";

export async function generateMetadata(): Promise<Metadata> {
  const { seo, settings, integrations } = await getContent();
  const images = ogImage(seo.ogImage, `${settings.name} — ${settings.tagline}`);
  const v = integrations.verification;
  // Site-ownership tags from Admin → Code & tracking.
  const other: Record<string, string> = {};
  if (v.bing) other["msvalidate.01"] = v.bing;
  if (v.facebook) other["facebook-domain-verification"] = v.facebook;
  if (v.pinterest) other["p:domain_verify"] = v.pinterest;
  const verification = v.google || Object.keys(other).length ? { ...(v.google ? { google: v.google } : {}), ...(Object.keys(other).length ? { other } : {}) } : undefined;
  return {
    metadataBase: new URL(settings.url),
    title: { default: seo.titleDefault, template: seo.titleTemplate },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: settings.name }],
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: settings.name,
      title: `${settings.name} — ${settings.tagline}`,
      description: seo.description,
      ...(images ? { images } : {}),
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/" },
    formatDetection: { telephone: false },
    ...(verification ? { verification } : {}),
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { theme } = await getContent();
  return { themeColor: theme.colors.ivory, width: "device-width", initialScale: 1 };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { theme } = await getContent();
  // Theme colours and fonts from Admin → Theme, layered over the defaults in globals.css.
  const themeCss = `:root{${COLOR_KEYS.map((k) => `--color-${k}:${theme.colors[k]};`).join("")}${fontCss(theme.fonts.display, theme.fonts.body)}}`;

  return (
    <html lang="en-IN" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <noscript>
          <style>{`.jsf-loader{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-svh antialiased">{children}</body>
    </html>
  );
}
