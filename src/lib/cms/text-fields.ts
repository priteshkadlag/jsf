import { forArchitects, whyChooseUs } from "@/data/site";
import type { TextValue, TitledText, Texts } from "./types";

type Base = { key: string; label: string; help?: string };
export type TextField =
  | (Base & { type: "text" | "textarea"; default: string })
  | (Base & { type: "image"; default: string })
  | (Base & { type: "list"; default: TitledText[] });

export type TextGroup = { id: string; page: string; title: string; fields: TextField[] };

const t = (key: string, label: string, def: string, help?: string): TextField => ({ key, label, type: "text", default: def, help });
const ta = (key: string, label: string, def: string, help?: string): TextField => ({ key, label, type: "textarea", default: def, help });
const img = (key: string, label: string, def: string): TextField => ({ key, label, type: "image", default: def });
const list = (key: string, label: string, def: readonly TitledText[]): TextField => ({ key, label, type: "list", default: [...def] });

const heroFields = (p: string, d: { eyebrow: string; title: string; accent: string; intro: string; image?: string; alt?: string }) => [
  t(`${p}.eyebrow`, "Small label above the title", d.eyebrow),
  t(`${p}.title`, "Title (first line)", d.title),
  t(`${p}.accent`, "Title (italic second line)", d.accent),
  ta(`${p}.intro`, "Intro paragraph", d.intro),
  ...(d.image ? [img(`${p}.image`, "Hero image", d.image), t(`${p}.imageAlt`, "Hero image description (alt text)", d.alt ?? "")] : []),
];

const ctaFields = (p: string, title: string, accent: string) => [
  t(`${p}.ctaTitle`, "Closing call-to-action title", title),
  t(`${p}.ctaAccent`, "Closing call-to-action (italic line)", accent),
];

/** Every piece of page copy the admin can edit, grouped by page and section, with the site's original text as default. */
export const TEXT_GROUPS: TextGroup[] = [
  {
    id: "home-hero",
    page: "Home",
    title: "Hero (door opening)",
    fields: [
      t("home.hero.eyebrow", "Small label", "Est. 1989 · Tuem, Goa"),
      t("home.hero.title", "Headline (left of the door)", "Architectural woodwork,"),
      t("home.hero.accent", "Headline (italic, right of the door)", "made to measure"),
      t("home.hero.subline", "Line under the headline", "Doors, architectural solutions & custom joinery"),
      t("home.hero.outroEyebrow", "Label after the door opens", "JSF Industries · Custom joinery since 1989"),
      t("home.hero.outroTitle", "Title after the door opens", "Precision woodwork for Goa’s finest villas,"),
      t("home.hero.outroAccent", "Title after the door opens (italic end)", "built to last."),
      t("home.hero.cta1", "First button", "Explore our projects"),
      t("home.hero.cta2", "Second button", "Inside our factory"),
    ],
  },
  {
    id: "home-intro",
    page: "Home",
    title: "01 · Introduction",
    fields: [
      t("home.intro.label", "Section label", "A legacy of fine woodwork"),
      ta("home.intro.title", "Large statement", "Since 1989, we have made the doors, windows and joinery that give Goa’s finest homes their character."),
      ta(
        "home.intro.lead",
        "Lead paragraph",
        "Founded by Shri Jivanbhai S. Fatania, JSF is a leader in doors and architectural joinery. We work from your drawings, solve the hard details and deliver woodwork that looks right and lasts.",
      ),
      ta(
        "home.intro.body",
        "Second paragraph",
        "Everything is made in our own factory in Tuem, Goa. That means custom work at scale, strict quality checks and on-time delivery.",
      ),
      t("home.intro.button", "Button", "Our story"),
      img("home.intro.image", "Arched image", "craft/teak-double-door"),
      t("home.intro.imageAlt", "Image description (alt text)", "A solid teak double door with brass handles at a villa entrance"),
    ],
  },
  {
    id: "home-services",
    page: "Home",
    title: "02 · What we do",
    fields: [
      t("home.services.label", "Section label", "What we do"),
      t("home.services.title", "Title", "Woodwork for every threshold"),
      ta("home.services.text", "Text", "The full scope of carpentry from one trusted team: designed with you, made in our factory and installed on site."),
    ],
  },
  {
    id: "home-architects",
    page: "Home",
    title: "For architects & designers",
    fields: [
      t("home.architects.label", "Section label", "For architects & designers"),
      t("home.architects.title", "Title", "You draw it."),
      t("home.architects.accent", "Title (italic end)", "We build it."),
      ta(
        "home.architects.text",
        "Text",
        "Architects and interior designers across Goa trust us with the details. We bring the technical know-how, so you don’t need to spend your time on site.",
      ),
      list("home.architects.items", "Reasons (cards)", forArchitects),
      t("home.architects.button", "Button", "Talk to our team"),
    ],
  },
  {
    id: "home-featured",
    page: "Home",
    title: "Selected projects",
    fields: [
      t("home.featured.label", "Section label", "Selected projects"),
      t("home.featured.title", "Title", "Villas we’ve"),
      t("home.featured.accent", "Title (italic end)", "opened up"),
      ta(
        "home.featured.text",
        "Text",
        "Doors, windows and carpentry for Goa’s most considered homes — in partnership with developers like Isprava and Vianaar.",
        "Pick which projects appear here under Projects → “Show on home page”.",
      ),
    ],
  },
  {
    id: "home-arch",
    page: "Home",
    title: "Signature arched window",
    fields: [
      t("home.arch.label", "Section label", "Signature"),
      t("home.arch.titleStart", "Title (before the italic word)", "The"),
      t("home.arch.accent", "Title (italic word)", "arched"),
      t("home.arch.titleEnd", "Title (after the italic word)", "window"),
      img("home.arch.image", "Full-screen image", "craft/arched-living"),
      t("home.arch.imageAlt", "Image description (alt text)", "Light pouring through a tall arched teak window into a villa living room"),
      t("home.arch.quoteLabel", "Quote label", "Arched windows by JSF"),
      ta(
        "home.arch.quote",
        "Quote",
        "More than an architectural feature — a carefully crafted portal that invites nature inside and bathes interiors in soft, filtered light. Each curve is a deliberate pause.",
      ),
    ],
  },
  {
    id: "home-factory",
    page: "Home",
    title: "The factory",
    fields: [
      t("home.factory.label", "Section label", "The factory · Tuem, Goa"),
      t("home.factory.title", "Title", "Where timber becomes craft"),
      ta(
        "home.factory.text",
        "Text",
        "Our Tuem facility is home to Goa’s first automated moulder machine and Goa’s first kiln seasoning plant — technology that pairs with the hands of skilled craftsmen to deliver precision at scale.",
      ),
      t("home.factory.button", "Button", "Explore our process"),
    ],
  },
  {
    id: "home-award",
    page: "Home & About",
    title: "Award",
    fields: [
      t("award.label", "Section label", "Recognition"),
      ta(
        "award.text",
        "Text",
        "Awarded by Business Goa — recognition of more than three decades spent perfecting the craft of the Goan door, and of the team that makes it happen every day.",
        "The award title and year are edited under Site info.",
      ),
      img("award.image", "Image", "award/ceremony"),
      t("award.imageAlt", "Image description (alt text)", "The JSF Industries team receiving the Business Goa award for Door Manufacturing Company of the Year 2025"),
    ],
  },
  {
    id: "home-clients",
    page: "Home & About",
    title: "Client logos strip",
    fields: [
      t("clientsStrip.label", "Section label", "Our esteemed clients"),
      t("clientsStrip.title", "Title", "Trusted by Goa’s leading developers"),
      ta(
        "clientsStrip.text",
        "Text",
        "Developers, architects and designers, from luxury villa collections to Manohar International Airport, who return to us project after project.",
      ),
      t("clientsStrip.link", "Link text", "View all clients →"),
    ],
  },
  {
    id: "about",
    page: "About",
    title: "About page",
    fields: [
      ...heroFields("about.hero", {
        eyebrow: "About JSF · Est. 1989",
        title: "A legacy of",
        accent: "fine woodwork",
        intro:
          "From custom doors to complete interiors, JSF brings precision woodwork to homes, villas and commercial spaces across Goa, working hand in hand with architects and designers.",
        image: "craft/facade",
        alt: "A whitewashed Goan villa with wooden doors and windows by JSF Industries",
      }),
      t("about.story.label", "Story section label", "Our story"),
      ta(
        "about.story.statement",
        "Story statement (large text)",
        "Founded in 1989 by Shri Jivanbhai S. Fatania, JSF is a leader in doors and architectural joinery. Our work balances good looks with performance, and is built to last.",
      ),
      ta("about.story.lead", "Story lead paragraph", "We specialise in doors, custom joinery and interiors, made from marine-grade ply and treated wood."),
      ta(
        "about.story.body",
        "Story second paragraph",
        "Our factory in Tuem, Goa, lets us make custom work efficiently and check every project closely. With decades of experience across homes and commercial projects, JSF delivers bespoke interiors, on time and to the detail.",
      ),
      img("about.story.image", "Story image", "factory/craftsman"),
      t("about.story.imageAlt", "Story image description", "A JSF craftsman assembling an arched timber frame in the workshop"),
      t("about.why.label", "“Why choose us” label", "Why choose us"),
      t("about.why.title", "“Why choose us” title", "The JSF promise"),
      list("about.why.items", "Reasons (cards)", whyChooseUs),
    ],
  },
  {
    id: "products",
    page: "Products",
    title: "Products page",
    fields: [
      ...heroFields("products.hero", {
        eyebrow: "Products",
        title: "Doors, furniture",
        accent: "& interiors",
        intro:
          "Everything we make is built at our own factory in Tuem, Goa — from solid teak entrances to complete villa interiors, with strict quality control at every step.",
        image: "craft/carved-door",
        alt: "A carved teak entrance door framed by a white villa portico",
      }),
      ...ctaFields("products", "Need something made to measure?", "We build it in Goa."),
    ],
  },
  {
    id: "projects",
    page: "Projects",
    title: "Projects page",
    fields: [
      ...heroFields("projects.hero", {
        eyebrow: "Projects",
        title: "Homes we’ve",
        accent: "given character",
        intro:
          "A selection of villas across Goa where JSF crafted the doors, windows, staircases and carpentry — in partnership with two of India’s most respected luxury developers.",
      }),
      ...ctaFields("projects", "Building something remarkable?", "Let’s add our chapter."),
    ],
  },
  {
    id: "gallery",
    page: "Gallery",
    title: "Gallery page",
    fields: [
      ...heroFields("gallery.hero", {
        eyebrow: "Gallery",
        title: "Every grain,",
        accent: "every detail",
        intro:
          "Arched teak windows, carved entrances, staircases and complete villa interiors — a visual archive of JSF’s work across Goa, from the factory floor to the finished home.",
      }),
      ...ctaFields("gallery", "Seen something you love?", "We can make it for you."),
    ],
  },
  {
    id: "clients",
    page: "Clients",
    title: "Clients page",
    fields: [
      ...heroFields("clients.hero", {
        eyebrow: "Clients",
        title: "Trusted by Goa’s",
        accent: "finest builders",
        intro:
          "Luxury villa developers, real-estate groups, architects and even an international airport — partners who return to JSF project after project for woodwork that is on time, on budget and built to last.",
      }),
      t("clients.partners.label", "Partners section label", "Key partners"),
      t("clients.partners.title", "Partners section title", "Two developers, dozens of villas"),
      t("clients.wall.label", "Logo wall label", "Our esteemed clients"),
      t("clients.wall.title", "Logo wall title", "In good company"),
      t("clients.wall.hint", "Logo wall hint", "Hover a logo to see who’s behind it."),
      ...ctaFields("clients", "Join Goa’s leading developers.", "Let’s build together."),
    ],
  },
  {
    id: "craftsmanship",
    page: "Craftsmanship",
    title: "Craftsmanship page",
    fields: [
      ...heroFields("craft.hero", {
        eyebrow: "Craftsmanship · Tuem, Goa",
        title: "Precision at scale,",
        accent: "finished by hand",
        intro:
          "Our factory at Plot No. 30/31, Industrial Estate, Tuem, pairs Goa's first automated moulder and kiln seasoning plant with the experience of craftsmen who have shaped timber for decades.",
        image: "factory/craftsman",
        alt: "A JSF craftsman shaping an arched window frame in the Tuem workshop",
      }),
      t("craft.process.label", "Process label", "Process"),
      t("craft.process.title", "Process title", "From log to landmark"),
      list("craft.process.steps", "Process steps", [
        {
          title: "Timber selection",
          text: "Every project starts with the right material: solid teak for entrances and windows that must weather the coast, marine-grade ply and treated wood made to last, and the right core and finish for flush, veneer and laminated doors.",
        },
        {
          title: "Kiln seasoning",
          text: "Timber is seasoned in our kiln plant to bring moisture down by around 15%, so doors and frames resist bending and cracking through Goa's monsoons.",
        },
        {
          title: "Precision moulding",
          text: "Our automated moulder shapes frames and profiles to exact, repeatable dimensions — around 2,000 door and window frames a month.",
        },
        {
          title: "Joinery & hand finishing",
          text: "Arches, fanlights, raised panels and mouldings are assembled and finished by skilled carpenters, with quality checks before anything leaves the floor.",
        },
        {
          title: "Installation",
          text: "Our teams install on site and work through the details with architects and developers, so every door and window sits true and the architect doesn't need to be there.",
        },
      ]),
      t("craft.machinery.label", "Machinery label", "Machinery"),
      t("craft.machinery.title", "Machinery title", "Two firsts for Goa"),
      ...ctaFields("craft", "See the factory for yourself.", "Visit us in Tuem."),
    ],
  },
  {
    id: "contact",
    page: "Contact",
    title: "Contact page",
    fields: [
      t("contact.hero.eyebrow", "Small label", "Contact"),
      t("contact.hero.title", "Title (first line)", "Let’s talk about"),
      t("contact.hero.accent", "Title (italic second line)", "your project"),
      ta("contact.note", "Note under the contact details", "Visits to the factory are welcome by appointment."),
      img("contact.image", "Arched image", "craft/fanlight-door"),
      t("contact.imageAlt", "Image description (alt text)", "A white panelled door with an arched fanlight"),
    ],
  },
  {
    id: "shared",
    page: "Shared",
    title: "Call-to-action band & 404 page",
    fields: [
      t("cta.title", "Default call-to-action title", "Designing a villa, hotel or home?"),
      t("cta.accent", "Default call-to-action (italic line)", "Let’s talk timber."),
      t("cta.button", "Call-to-action button", "Request a quote"),
      t("notFound.title", "404 title", "This door"),
      t("notFound.accent", "404 title (italic end)", "leads nowhere."),
      t("notFound.text", "404 text", "The page you’re looking for has moved or doesn’t exist."),
      t("notFound.button", "404 button", "Back to the entrance"),
    ],
  },
];

export const TEXT_DEFAULTS: Record<string, TextValue> = Object.fromEntries(
  TEXT_GROUPS.flatMap((g) => g.fields.map((f) => [f.key, f.default])),
);

/** Read a text value with its default as fallback. */
export function tx(texts: Texts, key: string): string {
  const v = texts[key] ?? TEXT_DEFAULTS[key];
  return typeof v === "string" ? v : "";
}

/** All plain-text values under a prefix, e.g. txGroup(texts, "home.hero") → { title, accent, … }, for client components. */
export function txGroup(texts: Texts, prefix: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(TEXT_DEFAULTS)) {
    if (key.startsWith(`${prefix}.`)) out[key.slice(prefix.length + 1)] = tx(texts, key);
  }
  return out;
}

export function txList(texts: Texts, key: string): TitledText[] {
  const v = texts[key] ?? TEXT_DEFAULTS[key];
  return Array.isArray(v) ? v : [];
}
