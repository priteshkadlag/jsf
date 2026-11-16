import type { ImageRef } from "@/lib/media";

export type Link = { label: string; href: string };
export type TitledText = { title: string; text: string };

export type Settings = {
  name: string;
  shortName: string;
  url: string;
  tagline: string;
  description: string;
  founded: number;
  founder: string;
  phone: string;
  /** Digits only with country code, e.g. 919763924949 — used for tel: and WhatsApp links. */
  phoneDigits: string;
  email: string;
  address: { line1: string; line2: string; city: string; postalCode: string; country: string };
  mapsHref: string;
  udyam: string;
  award: { title: string; by: string; year: number };
  /** Official profiles (Google Business Profile, Instagram, LinkedIn…), told to Google as "sameAs". */
  profiles: string[];
  /** Opening hours for Google's business details; no days = not shown. Times are "HH:MM". */
  hours: { days: string[]; opens: string; closes: string };
  /** Map pin, as decimal degrees (e.g. "15.6560"); both empty = not shown. */
  geo: { lat: string; lng: string };
};

export const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export const COLOR_KEYS = [
  "ivory",
  "paper",
  "sand",
  "ink",
  "heading",
  "stone",
  "espresso",
  "bark",
  "teak",
  "brass",
  "sage",
] as const;
export type ColorKey = (typeof COLOR_KEYS)[number];

export type Theme = {
  colors: Record<ColorKey, string>;
  fonts: { display: string; body: string };
};

export type HeaderContent = {
  nav: Link[];
  cta: Link;
  showCta: boolean;
  /** Optional uploaded logos; empty means the built-in JSF lock-up. */
  logoDark: ImageRef | "";
  logoLight: ImageRef | "";
};

export type FooterContent = {
  eyebrow: string;
  title: string;
  accent: string;
  primary: Link;
  secondary: Link;
  exploreHeading: string;
  /** Extra links listed under the header navigation in the footer. */
  extraLinks: Link[];
  showProducts: boolean;
  productsHeading: string;
  addressHeading: string;
  legalLine: string;
  copyright: string;
};

export type PageSeo = { title: string; description: string; ogImage: ImageRef | ""; noindex: boolean };

export type Seo = {
  titleDefault: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  ogImage: ImageRef | "";
  pages: Record<string, PageSeo>;
};

/** Analytics, verification tags and custom code (Admin → Code & tracking). */
export type Integrations = {
  /** Google Analytics 4 measurement ID, e.g. G-XXXXXXXXXX */
  gaId: string;
  /** Google Tag Manager container ID, e.g. GTM-XXXXXXX */
  gtmId: string;
  /** Meta (Facebook) Pixel ID — digits only */
  metaPixelId: string;
  /** Microsoft Clarity project ID */
  clarityId: string;
  verification: { google: string; bing: string; facebook: string; pinterest: string };
  /** Raw HTML/JS placed at the start of every public page. */
  headCode: string;
  /** Raw HTML/JS placed at the end of every public page. */
  bodyCode: string;
  /** Switch custom code off without deleting it (handy when a snippet breaks the site). */
  customCodeEnabled: boolean;
  /** Optional Google API key for PageSpeed tests in the admin (only used inside the admin). */
  pagespeedKey: string;
};

export type Project = {
  slug: string;
  name: string;
  developer: string;
  location: string;
  scope: string;
  scale: string;
  summary: string;
  body: string[];
  features: TitledText[];
  /** The first image is the cover. */
  images: ImageRef[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
};

export type Client = { name: string; logo: ImageRef | "" };
export type Partner = { name: string; logo: ImageRef | ""; text: string };
export type ClientsContent = { list: Client[]; partners: Partner[] };

export type GalleryItem = { image: ImageRef; caption: string; category: string; href: string };
export type GalleryContent = { categories: string[]; items: GalleryItem[] };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  cover: ImageRef | "";
  /** YYYY-MM-DD */
  date: string;
  author: string;
  tags: string[];
  /** Simple Markdown: ## headings, lists, **bold**, *italic*, [links](url), ![alt](image). */
  body: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
};
export type BlogContent = { heading: string; accent: string; intro: string; posts: BlogPost[] };

export type TextValue = string | TitledText[];
export type Texts = Record<string, TextValue>;

export type Content = {
  settings: Settings;
  theme: Theme;
  header: HeaderContent;
  footer: FooterContent;
  seo: Seo;
  integrations: Integrations;
  texts: Texts;
  projects: Project[];
  clients: ClientsContent;
  gallery: GalleryContent;
  blog: BlogContent;
};

export type DocName = keyof Content;
export const DOC_NAMES: DocName[] = [
  "settings",
  "theme",
  "header",
  "footer",
  "seo",
  "integrations",
  "texts",
  "projects",
  "clients",
  "gallery",
  "blog",
];
