import "server-only";
import { products } from "@/data/products";
import { getMedia } from "@/lib/media";
import { getContent } from "./content";
import type { Settings } from "./types";

/*
 * Schema.org structured data (JSON-LD). The business is defined once, with a stable @id, and every
 * other entity (website, projects, posts, breadcrumbs) points at it instead of repeating it.
 */

export const businessId = (s: Settings) => `${s.url}/#business`;
export const websiteId = (s: Settings) => `${s.url}/#website`;
export const absolute = (s: Settings, src: string) => new URL(src, s.url).toString();

/** Safe to drop into <script type="application/ld+json">. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

export function businessGraph(s: Settings, seoImage: string) {
  const hours = s.hours.days.length
    ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: s.hours.days, opens: s.hours.opens, closes: s.hours.closes }]
    : undefined;
  const geo = s.geo.lat && s.geo.lng ? { "@type": "GeoCoordinates", latitude: Number(s.geo.lat), longitude: Number(s.geo.lng) } : undefined;

  const business = {
    "@type": "HomeAndConstructionBusiness",
    "@id": businessId(s),
    name: s.name,
    alternateName: s.shortName || undefined,
    slogan: s.tagline || undefined,
    description: s.description,
    url: s.url,
    logo: absolute(s, "/brand/jsf-logo-dark.png"),
    image: absolute(s, getMedia(seoImage || "craft/arched-hall").src),
    foundingDate: String(s.founded),
    founder: s.founder ? { "@type": "Person", name: s.founder } : undefined,
    telephone: `+${s.phoneDigits}`,
    email: s.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: [s.address.line1, s.address.line2].filter(Boolean).join(", "),
      addressLocality: s.address.line2.split(",").pop()?.trim() || s.address.city,
      addressRegion: s.address.city,
      postalCode: s.address.postalCode,
      addressCountry: s.address.country,
    },
    geo,
    hasMap: s.mapsHref || undefined,
    openingHoursSpecification: hours,
    areaServed: { "@type": "State", name: "Goa", containedInPlace: { "@type": "Country", name: "India" } },
    knowsAbout: products.map((p) => p.name),
    award: s.award.title ? `${s.award.title} — ${s.award.by} ${s.award.year}` : undefined,
    sameAs: s.profiles.length ? s.profiles : undefined,
  };

  const website = {
    "@type": "WebSite",
    "@id": websiteId(s),
    url: s.url,
    name: s.name,
    inLanguage: "en-IN",
    publisher: { "@id": businessId(s) },
  };

  return { "@context": "https://schema.org", "@graph": [business, website] };
}

/** Home › … › current page. `trail` excludes Home; the last item is the current page. */
export async function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  const { settings } = await getContent();
  const items = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${settings.url}${it.path === "/" ? "" : it.path}`,
    })),
  };
}

/** Cuts text to fit a search-result snippet, at a word boundary. */
export function snippet(text: string, max = 155) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:—–-]+$/, "")}…`;
}
