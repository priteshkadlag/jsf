# JSF Industries — website

Marketing site for JSF Industries (est. 1989, Tuem, Goa): premium teakwood doors, wooden windows and bespoke carpentry.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis · Three.js / React Three Fiber / Drei · Motion · SplitType

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Content & assets

All imagery comes from the client folder `../JSF WEBSITE X POSTE & CO`. Run `npm run assets` after changing anything there.
The script (`scripts/prepare-assets.mjs`):

- converts and resizes photos to WebP in `public/images/` and adds blur placeholders
- builds transparent dark/light logos and the favicons from the supplied logo
- copies the factory videos to `public/videos/`
- writes the typed manifest `src/data/media.generated.ts`

Most copy is edited in the admin panel (below). `src/data/` holds the original content the admin starts from, plus products, stats and machinery.
New projects are best added in the admin. The asset script is only needed for photos you want built into the site.

## Admin panel (`/admin`)

Set `ADMIN_PASSWORD` (8+ characters) in `.env.local` or the server environment, then sign in at `/admin`. See `.env.example` for every option.

| Section | What it edits |
| --- | --- |
| Page text & images | Headings, paragraphs, buttons, cards and section images on every page |
| Projects | Add / edit / reorder / delete projects, their photos (first = cover), "show on home page", SEO |
| Gallery | Photos, captions, categories, links; import a project's photos in one click |
| Clients | Client logos and the key-partner cards |
| Blog | Articles with a Markdown editor and preview, drafts, cover image, tags, SEO (`/blog`) |
| SEO | Default/home title, title pattern, descriptions, keywords, share images, per-page noindex |
| Code & tracking | Google PageSpeed test (mobile/desktop scores + Core Web Vitals), GA4, Tag Manager, Meta Pixel, Microsoft Clarity, verification meta tags (Google, Bing, Facebook, Pinterest), custom code at the start/end of every public page with an on/off switch |
| Header & footer | Menu links, header button, custom logos, footer text, buttons and links |
| Theme | 11 colours (with presets) and display/body fonts, with a live preview |
| Site info | Business name, phone, WhatsApp, email, address, award |
| Media library | All uploads; delete ones you no longer need |

How it works:

- Everything starts from the original content in `src/data/` and `src/lib/cms/`. Only what you change is stored, and **Restore original** in each section goes back to it.
- Public pages stay statically prerendered. Saving calls `updateTag("cms")`, so the next visit gets the new content.
- Images are resized to at most 2400 px and converted to WebP in the browser before upload (JPEG, PNG, WebP, AVIF and GIF are accepted; the file sent must be under 4 MB, which Vercel requires).
- **Storage.** On a normal Node server, content goes to `./content/*.json` and uploads to `./content/uploads/`, served at `/uploads/…`. This folder is git-ignored, so back it up and keep it between deploys (or point `CMS_CONTENT_DIR` at a persistent disk). On Vercel, set `BLOB_READ_WRITE_TOKEN` and everything is stored in Vercel Blob instead.
- Editable copy is listed in `src/lib/cms/text-fields.ts`; add an entry there and read it with `tx(texts, key)` to make more text editable.
- Still edited in code: products (`src/data/products.ts`), stats, machinery, milestones and testimonials (`src/data/site.ts`).

## Contact form

`POST /api/contact` validates each enquiry (it also has a honeypot). Set `CONTACT_WEBHOOK_URL` to forward enquiries as JSON to Zapier, Make, a CRM or a mail service. Without it, enquiries are only logged on the server.

## Structure

- `src/components/three/` — the 3D arched teak door in the hero. It's built procedurally, so there are no model files to load.
- `src/components/home/` — the home page sections
- `src/components/ui/` — reusable pieces: `RevealText` and `ScrubText` (SplitType), `ParallaxImage`, `Marquee`, `Magnetic`, `Counter`, `PageHero`
- `src/components/providers/SmoothScroll.tsx` — Lenis, driven by the GSAP ticker and kept in sync with ScrollTrigger

## Accessibility & performance

- Visitors who prefer reduced motion get no smooth scroll or scrubbed animations, and a still hero instead of the 3D door.
- Split text has a screen-reader copy, and all animated copies are `aria-hidden`.
- The 3D scene is lazy-loaded and stops rendering when it is off-screen.
- Videos only load when they scroll into view.
- Every page is statically prerendered.
