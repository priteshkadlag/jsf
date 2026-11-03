import type { Metadata, Viewport } from "next";
import { EB_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/layout/Preloader";
import Cursor from "@/components/layout/Cursor";
import BackToTop from "@/components/layout/BackToTop";
import { site } from "@/data/site";

const display = EB_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Premium Wooden Doors & Windows in Goa · Est. 1989`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "teakwood doors Goa",
    "wooden windows Goa",
    "arched wooden windows",
    "door manufacturer Goa",
    "veneer doors",
    "laminated doors",
    "flush doors",
    "bespoke carpentry Goa",
    "JSF Industries",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: "/images/craft/arched-hall.webp", width: 1950, height: 1097, alt: "Arched teak windows crafted by JSF Industries" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#e8e3db",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: site.name,
  url: site.url,
  logo: `${site.url}/brand/logo-dark.png`,
  image: `${site.url}/images/craft/arched-hall.webp`,
  description: site.description,
  foundingDate: String(site.founded),
  founder: { "@type": "Person", name: site.founder },
  telephone: "+919763924949",
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${site.address.line1}, ${site.address.line2}`,
    addressLocality: "Tuem",
    addressRegion: "Goa",
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  areaServed: "Goa, India",
  award: `${site.award.title} — ${site.award.by} ${site.award.year}`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className="min-h-svh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-ivory"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <Preloader />
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <BackToTop />
          <Cursor />
        </SmoothScroll>
      </body>
    </html>
  );
}
