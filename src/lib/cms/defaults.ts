import { site, nav } from "@/data/site";
import { projects as seedProjects } from "@/data/projects";
import { clients as seedClients } from "@/data/clients";
import { mediaByPrefix, type ImageRef } from "@/lib/media";
import { DEFAULT_BODY_FONT, DEFAULT_DISPLAY_FONT } from "./font-options";
import type { Content, GalleryItem, PageSeo } from "./types";

/*
 * The site's original, hand-written content. Anything not yet edited in the admin falls back to
 * these values, so the site looks exactly as it did before the CMS existed.
 */

const toTitle = (key: string) =>
  key
    .split("/")
    .pop()!
    .replace(/-\d+$/, "")
    .replace(/-/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

/** Interleave groups so the "All" view mixes projects instead of showing one villa after another. */
function interleave<T>(groups: T[][]): T[] {
  const out: T[] = [];
  const max = Math.max(...groups.map((g) => g.length));
  for (let i = 0; i < max; i++) groups.forEach((g) => g[i] && out.push(g[i]));
  return out;
}

function defaultGalleryItems(): GalleryItem[] {
  const projectGroups = seedProjects.map((p) =>
    p.images.map<GalleryItem>((image) => ({
      image,
      caption: p.name,
      category: `${p.developer} villas`,
      href: `/projects/${p.slug}`,
    })),
  );
  const crafted = [...mediaByPrefix("craft/"), ...mediaByPrefix("doors/")]
    .filter((k) => k !== "craft/hero")
    .map<GalleryItem>((image: ImageRef) => ({
      image,
      caption: image.startsWith("doors/") ? `${toTitle(image)} door` : toTitle(image),
      category: "Doors & windows",
      href: "",
    }));
  const factory = mediaByPrefix("factory/").map<GalleryItem>((image) => ({
    image,
    caption: `Tuem factory — ${toTitle(image).toLowerCase()}`,
    category: "Factory",
    href: "",
  }));
  return interleave([...projectGroups, crafted, factory]);
}

const FEATURED = ["villa-rosa", "amora", "la-selva", "moira-chapters", "la-mandarina", "mandrem"];

const page = (title: string, description: string): PageSeo => ({ title, description, ogImage: "", noindex: false });

/** Static pages whose SEO can be edited, in admin order. */
export const SEO_PAGES: { path: string; label: string }[] = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/products", label: "Products" },
  { path: "/projects", label: "Projects" },
  { path: "/gallery", label: "Gallery" },
  { path: "/clients", label: "Clients" },
  { path: "/craftsmanship", label: "Craftsmanship" },
  { path: "/blog", label: "Blog" },
  { path: "/contact", label: "Contact" },
];

export function defaultContent(): Content {
  return {
    settings: {
      name: site.name,
      shortName: site.shortName,
      url: site.url,
      tagline: site.tagline,
      description: site.description,
      founded: site.founded,
      founder: site.founder,
      phone: site.phone,
      phoneDigits: site.phoneHref.replace(/\D/g, ""),
      email: site.email,
      address: { ...site.address },
      mapsHref: site.mapsHref,
      udyam: site.udyam,
      award: { ...site.award },
      profiles: [],
      hours: { days: [], opens: "09:00", closes: "18:00" },
      geo: { lat: "", lng: "" },
    },
    theme: {
      colors: {
        ivory: "#e8e3db",
        paper: "#f1eee8",
        sand: "#dcd5c9",
        ink: "#1f2a24",
        heading: "#30463a",
        stone: "#565f52",
        espresso: "#294236",
        bark: "#20352b",
        teak: "#5a3e2e",
        brass: "#b4935a",
        sage: "#8a9a83",
      },
      fonts: { display: DEFAULT_DISPLAY_FONT, body: DEFAULT_BODY_FONT },
    },
    header: {
      nav: nav.map((n) => ({ label: n.label, href: n.href })),
      cta: { label: "Enquire now", href: "/contact" },
      showCta: true,
      logoDark: "",
      logoLight: "",
    },
    footer: {
      eyebrow: "Have a project in mind?",
      title: "Let’s craft your",
      accent: "next entrance.",
      primary: { label: "Start a conversation", href: "/contact" },
      secondary: { label: "WhatsApp us", href: "whatsapp" },
      exploreHeading: "Explore",
      extraLinks: [{ label: "Blog", href: "/blog" }],
      showProducts: true,
      productsHeading: "Products",
      addressHeading: "Factory",
      legalLine: `MSME (Udyam) registered · ${site.udyam}`,
      copyright: `© ${site.name} · Est. ${site.founded} · Crafted in Goa`,
    },
    seo: {
      titleDefault: `${site.name} — Wooden Doors, Joinery & Interiors in Goa`,
      titleTemplate: `%s · ${site.name}`,
      description: site.description,
      keywords: [
        "doors Goa",
        "teakwood doors Goa",
        "custom joinery Goa",
        "architectural joinery Goa",
        "custom furniture Goa",
        "bespoke interiors Goa",
        "wooden windows Goa",
        "arched wooden windows",
        "door manufacturer Goa",
        "veneer doors",
        "laminated doors",
        "flush doors",
        "wall panelling Goa",
        "wooden staircases Goa",
        "JSF Industries",
      ],
      ogImage: "craft/arched-hall",
      pages: {
        "/": page("", ""),
        "/about": page(
          "About — A Legacy of Fine Woodwork",
          "Founded in 1989 by Shri Jivanbhai S. Fatania, JSF Industries is a Goa-based leader in doors, architectural joinery and bespoke interiors.",
        ),
        "/products": page(
          "Products — Doors, Furniture & Interiors",
          "Doors, custom furniture, bespoke interiors, wall panelling, staircases and ceilings, made by JSF Industries in Goa.",
        ),
        "/projects": page(
          "Projects — Luxury Villas Across Goa",
          "Wooden doors, arched windows, staircases and carpentry by JSF Industries for luxury villas across Goa, from Isprava's Amora to Vianaar's La Selva.",
        ),
        "/gallery": page(
          "Gallery — Doors, Windows & Woodwork",
          "Browse JSF Industries' work: arched teak windows, wooden doors, staircases and carpentry across Goa's finest villas, plus our doors and factory in Tuem.",
        ),
        "/clients": page(
          "Clients — Goa's Leading Developers",
          "Doors, windows and carpentry for Isprava, Vianaar, Manohar International Airport, Vision Dempo and more of Goa's leading developers.",
        ),
        "/craftsmanship": page(
          "Craftsmanship — Our Factory in Tuem, Goa",
          "Inside our Tuem factory: Goa's first automated moulder and a kiln seasoning plant, making around 2,000 door and window frames a month.",
        ),
        "/blog": page(
          "Blog — Notes on Doors, Windows & Woodwork",
          "Ideas, guides and project stories from JSF Industries on teak doors, wooden windows, joinery and building in Goa's climate.",
        ),
        "/contact": page(
          "Contact — Request a Quote",
          `Talk to JSF Industries about doors, joinery and interiors for your project. Call ${site.phone}, email ${site.email} or visit our factory in Tuem, Goa.`,
        ),
      },
    },
    integrations: {
      gaId: "",
      gtmId: "",
      metaPixelId: "",
      clarityId: "",
      verification: { google: "", bing: "", facebook: "", pinterest: "" },
      headCode: "",
      bodyCode: "",
      customCodeEnabled: true,
      pagespeedKey: "",
    },
    texts: {},
    projects: seedProjects.map((p) => ({
      slug: p.slug,
      name: p.name,
      developer: p.developer,
      location: p.location,
      scope: p.scope,
      scale: p.scale ?? "",
      summary: p.summary,
      body: [...p.body],
      features: p.features ? p.features.map((f) => ({ ...f })) : [],
      images: [...p.images],
      featured: FEATURED.includes(p.slug),
      seoTitle: "",
      seoDescription: "",
    })),
    clients: {
      list: seedClients.map((c) => ({ ...c })),
      partners: [
        {
          name: "Isprava",
          logo: "clients/isprava",
          text: "Our longest-running villa partnership — from the 22 villas of Moira Chapters to Amora, Villa Rosa and the Mandrem estate.",
        },
        {
          name: "Vianaar",
          logo: "clients/vianaar",
          text: "Doors, windows, staircases and ceilings for Vianaar's Goan homes — including all 10 villas at La Selva, Assagao.",
        },
      ],
    },
    gallery: {
      categories: ["Isprava villas", "Vianaar villas", "Doors & windows", "Factory"],
      items: defaultGalleryItems(),
    },
    blog: {
      heading: "Notes from",
      accent: "the workshop",
      intro: "Guides, ideas and project stories on doors, windows and fine woodwork — written for homeowners, architects and designers in Goa.",
      posts: [],
    },
  };
}
