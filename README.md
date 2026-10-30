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

Copy lives in `src/data/`: `site.ts` (contact details, stats, machinery), `projects.ts`, `products.ts` and `clients.ts`.
To add a project, add its folder to `PROJECTS` in the asset script, run `npm run assets`, then add an entry to `projects.ts`.

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
