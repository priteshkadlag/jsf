import { isMediaKey } from "@/lib/media";
import { BODY_FONTS, DISPLAY_FONTS } from "./font-options";
import { TEXT_DEFAULTS } from "./text-fields";
import {
  COLOR_KEYS,
  type BlogContent,
  type BlogPost,
  type ClientsContent,
  type Content,
  type DocName,
  type FooterContent,
  type GalleryContent,
  type HeaderContent,
  type Integrations,
  type Link,
  type PageSeo,
  type Project,
  type Seo,
  type Settings,
  type TextValue,
  type Texts,
  type Theme,
  WEEK_DAYS,
  type TitledText,
} from "./types";

/*
 * Everything read from storage or sent by the admin passes through here, so pages can trust the
 * shape of their content: unknown keys are dropped, wrong types fall back to defaults, links and
 * image references are restricted to safe values.
 */

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function str(v: unknown, fallback = "", max = 20000): string {
  if (typeof v !== "string") return fallback;
  return v.replace(/\r\n/g, "\n").slice(0, max);
}
const line = (v: unknown, fallback = "") => str(v, fallback, 400).replace(/\n/g, " ").trim();
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
function int(v: unknown, fallback: number) {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Internal paths, anchors, http(s), mailto:, tel: and the "whatsapp"/"phone" shortcuts. Never javascript: etc. */
export function safeHref(v: unknown, fallback = ""): string {
  const s = line(v);
  if (!s) return fallback;
  if (s === "whatsapp" || s === "phone" || s === "email") return s;
  if (/^(\/(?!\/)|#)/.test(s)) return s;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(s)) return s;
  return fallback;
}

/** Built-in manifest keys ("craft/hero"), uploaded files ("/uploads/…") or https image URLs. */
export function safeImage(v: unknown, fallback = ""): string {
  const s = line(v);
  if (!s) return fallback;
  if (isMediaKey(s)) return s;
  if (/^\/uploads\/[a-z0-9/._-]+$/i.test(s)) return s;
  if (/^https:\/\/[^\s"'<>]+$/i.test(s)) return s;
  return fallback;
}

const link = (v: unknown, d: Link): Link => {
  const o = obj(v);
  return { label: line(o.label, d.label), href: safeHref(o.href, d.href) };
};
const links = (v: unknown, d: Link[]): Link[] =>
  Array.isArray(v) ? v.map((x) => link(x, { label: "", href: "" })).filter((l) => l.label && l.href).slice(0, 30) : d;

const titled = (v: unknown): TitledText[] =>
  arr(v)
    .map((x) => {
      const o = obj(x);
      return { title: line(o.title), text: str(o.text, "", 4000).trim() };
    })
    .filter((x) => x.title || x.text)
    .slice(0, 40);

const color = (v: unknown, d: string) => (typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v.trim()) ? v.trim().toLowerCase() : d);

function settings(v: unknown, d: Settings): Settings {
  const o = obj(v);
  const a = obj(o.address);
  const aw = obj(o.award);
  const h = obj(o.hours);
  const g = obj(o.geo);
  const url = line(o.url, d.url).replace(/\/+$/, "");
  return {
    name: line(o.name, d.name) || d.name,
    shortName: line(o.shortName, d.shortName),
    url: /^https?:\/\/[^\s/]+/i.test(url) ? url : d.url,
    tagline: line(o.tagline, d.tagline),
    description: str(o.description, d.description, 1000).trim(),
    founded: int(o.founded, d.founded),
    founder: line(o.founder, d.founder),
    phone: line(o.phone, d.phone),
    phoneDigits: line(o.phoneDigits, d.phoneDigits).replace(/\D/g, "") || d.phoneDigits,
    email: line(o.email, d.email),
    address: {
      line1: line(a.line1, d.address.line1),
      line2: line(a.line2, d.address.line2),
      city: line(a.city, d.address.city),
      postalCode: line(a.postalCode, d.address.postalCode),
      country: line(a.country, d.address.country),
    },
    mapsHref: safeHref(o.mapsHref, d.mapsHref),
    udyam: line(o.udyam, d.udyam),
    award: { title: line(aw.title, d.award.title), by: line(aw.by, d.award.by), year: int(aw.year, d.award.year) },
    profiles: Array.isArray(o.profiles)
      ? [...new Set(o.profiles.map((p) => line(p)).filter((p) => /^https:\/\/[^\s"'<>]+$/i.test(p)))].slice(0, 20)
      : d.profiles,
    hours: {
      days: Array.isArray(h.days) ? WEEK_DAYS.filter((day) => (h.days as unknown[]).includes(day)) : d.hours.days,
      opens: time(h.opens, d.hours.opens),
      closes: time(h.closes, d.hours.closes),
    },
    geo: { lat: coord(g.lat, 90), lng: coord(g.lng, 180) },
  };
}

const time = (v: unknown, d: string) => (typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v.trim()) ? v.trim() : d);
/** A decimal coordinate within ±limit, or "" (e.g. when the field is empty or invalid). */
function coord(v: unknown, limit: number): string {
  const s = line(v);
  const n = Number(s);
  return s && Number.isFinite(n) && Math.abs(n) <= limit ? String(n) : "";
}

function theme(v: unknown, d: Theme): Theme {
  const o = obj(v);
  const c = obj(o.colors);
  const f = obj(o.fonts);
  const display = typeof f.display === "string" && DISPLAY_FONTS.some((x) => x.id === f.display) ? f.display : d.fonts.display;
  const body = typeof f.body === "string" && BODY_FONTS.some((x) => x.id === f.body) ? f.body : d.fonts.body;
  return {
    colors: Object.fromEntries(COLOR_KEYS.map((k) => [k, color(c[k], d.colors[k])])) as Theme["colors"],
    fonts: { display, body },
  };
}

function header(v: unknown, d: HeaderContent): HeaderContent {
  const o = obj(v);
  return {
    nav: links(o.nav, d.nav),
    cta: link(o.cta, d.cta),
    showCta: bool(o.showCta, d.showCta),
    logoDark: safeImage(o.logoDark, ""),
    logoLight: safeImage(o.logoLight, ""),
  };
}

function footer(v: unknown, d: FooterContent): FooterContent {
  const o = obj(v);
  return {
    eyebrow: line(o.eyebrow, d.eyebrow),
    title: line(o.title, d.title),
    accent: line(o.accent, d.accent),
    primary: link(o.primary, d.primary),
    secondary: link(o.secondary, d.secondary),
    exploreHeading: line(o.exploreHeading, d.exploreHeading),
    extraLinks: links(o.extraLinks, d.extraLinks),
    showProducts: bool(o.showProducts, d.showProducts),
    productsHeading: line(o.productsHeading, d.productsHeading),
    addressHeading: line(o.addressHeading, d.addressHeading),
    legalLine: line(o.legalLine, d.legalLine),
    copyright: line(o.copyright, d.copyright),
  };
}

function pageSeo(v: unknown, d: PageSeo): PageSeo {
  const o = obj(v);
  return {
    title: line(o.title, d.title),
    description: str(o.description, d.description, 400).replace(/\n/g, " ").trim(),
    ogImage: safeImage(o.ogImage, d.ogImage),
    noindex: bool(o.noindex, d.noindex),
  };
}

function seo(v: unknown, d: Seo): Seo {
  const o = obj(v);
  const pages = obj(o.pages);
  return {
    titleDefault: line(o.titleDefault, d.titleDefault) || d.titleDefault,
    titleTemplate: line(o.titleTemplate, d.titleTemplate).includes("%s") ? line(o.titleTemplate) : d.titleTemplate,
    description: str(o.description, d.description, 400).replace(/\n/g, " ").trim(),
    keywords: Array.isArray(o.keywords) ? o.keywords.map((k) => line(k)).filter(Boolean).slice(0, 60) : d.keywords,
    ogImage: safeImage(o.ogImage, d.ogImage),
    pages:Object.fromEntries(Object.entries(d.pages).map(([path, def]) => [path, pageSeo(pages[path], def)])),
  };
}

/** Keeps an ID only if it matches the service's format exactly — these values are written into script tags. */
const id = (v: unknown, re: RegExp) => {
  const s = line(v).trim();
  return re.test(s) ? s : "";
};
/** Verification tokens: users often paste the whole <meta> tag, so pull out the content value. */
const token = (v: unknown) => {
  const s = line(v).trim();
  const m = /content=["']([^"']+)["']/i.exec(s);
  return (m ? m[1] : s).replace(/[^A-Za-z0-9_.=-]/g, "").slice(0, 200);
};

function integrations(v: unknown, d: Integrations): Integrations {
  const o = obj(v);
  const ver = obj(o.verification);
  return {
    gaId: id(typeof o.gaId === "string" ? o.gaId.toUpperCase() : "", /^G-[A-Z0-9]{4,20}$/),
    gtmId: id(typeof o.gtmId === "string" ? o.gtmId.toUpperCase() : "", /^GTM-[A-Z0-9]{4,12}$/),
    metaPixelId: id(o.metaPixelId, /^\d{6,20}$/),
    clarityId: id(typeof o.clarityId === "string" ? o.clarityId.toLowerCase() : "", /^[a-z0-9]{6,20}$/),
    verification: { google: token(ver.google), bing: token(ver.bing), facebook: token(ver.facebook), pinterest: token(ver.pinterest) },
    // Raw code is the admin's own choice to embed; only the size is limited.
    headCode: str(o.headCode, d.headCode, 50000),
    bodyCode: str(o.bodyCode, d.bodyCode, 50000),
    customCodeEnabled: bool(o.customCodeEnabled, d.customCodeEnabled),
    pagespeedKey: id(o.pagespeedKey, /^[A-Za-z0-9_-]{20,60}$/),
  };
}

function texts(v: unknown): Texts {
  const o = obj(v);
  const out: Texts = {};
  for (const [key, def] of Object.entries(TEXT_DEFAULTS)) {
    if (!(key in o)) continue;
    const val = o[key];
    let clean: TextValue | undefined;
    if (Array.isArray(def)) clean = Array.isArray(val) ? titled(val) : undefined;
    else if (typeof val === "string") clean = /image$/i.test(key) ? safeImage(val, def) : str(val, def, 4000);
    // Only store real edits, so later changes to the defaults still show through.
    if (clean !== undefined && JSON.stringify(clean) !== JSON.stringify(def)) out[key] = clean;
  }
  return out;
}

function uniqueSlug(base: string, used: Set<string>, fallback: string) {
  let s = SLUG_RE.test(base) ? base : slugify(base) || fallback;
  if (used.has(s)) {
    let i = 2;
    while (used.has(`${s}-${i}`)) i++;
    s = `${s}-${i}`;
  }
  used.add(s);
  return s;
}

function projects(v: unknown): Project[] {
  const used = new Set<string>();
  return arr(v)
    .slice(0, 300)
    .map((x, i) => {
      const o = obj(x);
      const name = line(o.name);
      return {
        slug: uniqueSlug(line(o.slug) || name, used, `project-${i + 1}`),
        name: name || "Untitled project",
        developer: line(o.developer),
        location: line(o.location),
        scope: line(o.scope),
        scale: line(o.scale),
        summary: str(o.summary, "", 1000).trim(),
        body: arr(o.body)
          .map((p) => str(p, "", 6000).trim())
          .filter(Boolean),
        features: titled(o.features),
        images: arr(o.images)
          .map((im) => safeImage(im))
          .filter(Boolean)
          .slice(0, 200),
        featured: bool(o.featured, false),
        seoTitle: line(o.seoTitle),
        seoDescription: str(o.seoDescription, "", 400).replace(/\n/g, " ").trim(),
      };
    });
}

function clients(v: unknown, d: ClientsContent): ClientsContent {
  const o = obj(v);
  return {
    list: Array.isArray(o.list)
      ? o.list
          .map((x) => {
            const c = obj(x);
            return { name: line(c.name), logo: safeImage(c.logo) };
          })
          .filter((c) => c.name)
          .slice(0, 300)
      : d.list,
    partners: Array.isArray(o.partners)
      ? o.partners
          .map((x) => {
            const c = obj(x);
            return { name: line(c.name), logo: safeImage(c.logo), text: str(c.text, "", 1000).trim() };
          })
          .filter((c) => c.name)
          .slice(0, 12)
      : d.partners,
  };
}

function gallery(v: unknown, d: GalleryContent): GalleryContent {
  const o = obj(v);
  return {
    categories: Array.isArray(o.categories) ? [...new Set(o.categories.map((c) => line(c)).filter(Boolean))].slice(0, 30) : d.categories,
    items: Array.isArray(o.items)
      ? o.items
          .map((x) => {
            const g = obj(x);
            return { image: safeImage(g.image), caption: line(g.caption), category: line(g.category), href: safeHref(g.href) };
          })
          .filter((g) => g.image)
          .slice(0, 2000)
      : d.items,
  };
}

function blog(v: unknown, d: BlogContent): BlogContent {
  const o = obj(v);
  const used = new Set<string>();
  const posts: BlogPost[] = Array.isArray(o.posts)
    ? o.posts.slice(0, 1000).map((x, i) => {
        const p = obj(x);
        const title = line(p.title);
        const date = line(p.date);
        return {
          slug: uniqueSlug(line(p.slug) || title, used, `post-${i + 1}`),
          title: title || "Untitled post",
          excerpt: str(p.excerpt, "", 600).replace(/\n/g, " ").trim(),
          cover: safeImage(p.cover),
          date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
          author: line(p.author),
          tags: arr(p.tags)
            .map((t) => line(t))
            .filter(Boolean)
            .slice(0, 12),
          body: str(p.body, "", 100000),
          published: bool(p.published, false),
          seoTitle: line(p.seoTitle),
          seoDescription: str(p.seoDescription, "", 400).replace(/\n/g, " ").trim(),
        };
      })
    : d.posts;
  return { heading: line(o.heading, d.heading), accent: line(o.accent, d.accent), intro: str(o.intro, d.intro, 1000).trim(), posts };
}

export function normalizeDoc<K extends DocName>(name: K, raw: unknown, defaults: Content): Content[K] {
  const fns: { [N in DocName]: (v: unknown) => Content[N] } = {
    settings: (v) => settings(v, defaults.settings),
    theme: (v) => theme(v, defaults.theme),
    header: (v) => header(v, defaults.header),
    footer: (v) => footer(v, defaults.footer),
    seo: (v) => seo(v, defaults.seo),
    integrations: (v) => integrations(v, defaults.integrations),
    texts: (v) => texts(v),
    projects: (v) => (Array.isArray(v) ? projects(v) : defaults.projects),
    clients: (v) => clients(v, defaults.clients),
    gallery: (v) => gallery(v, defaults.gallery),
    blog: (v) => blog(v, defaults.blog),
  };
  return fns[name](raw) as Content[K];
}
