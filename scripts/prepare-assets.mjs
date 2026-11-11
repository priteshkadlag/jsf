// Converts the raw brand assets (../JSF WEBSITE X POSTE & CO) into web-ready
// files under /public and writes a typed manifest to src/data/media.generated.ts.
// Run with: npm run assets
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { prepareLogo } from "./prepare-logo.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.resolve(ROOT, "..", "JSF WEBSITE X POSTE & CO");
const OUT = path.join(ROOT, "public");
const MANIFEST = path.join(ROOT, "src", "data", "media.generated.ts");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const I = "PROJECTS/ISPRAVA SITE PHOTOS";
const V = "PROJECTS/VIANAAR SITE PICTURES";

/** Each project: folders to pull from, the cover file, and how many images to keep. */
const PROJECTS = {
  "villa-rosa": { dirs: [`${I}/VILLA ROSA - ISPRAVA`], cover: "1-2.webp", max: 13 },
  amora: {
    dirs: [`${I}/AMORA PROJECT/AMORA VILLA B`, `${I}/AMORA PROJECT/AMORA VILLA D`, `${I}/AMORA PROJECT/AMORA VILLA - F`],
    cover: "14.jpg",
    max: 16,
  },
  "moira-chapters": { dirs: [`${I}/MOIRA CHAPTERS 22 VILLAS/JEPG`], cover: "Picture1.jpg", max: 15 },
  "calisto-beleza": {
    dirs: [`${I}/BELEZA PROJECT`, `${I}/CALISTO PROJECT/CALISTO VILLA B - ISPRAVA`, `${I}/CALISTO PROJECT/CALISTO VILLA D - ISPRAVA`],
    cover: "24_Night_Pool_Facade.webp",
    max: 16,
  },
  mandrem: {
    dirs: [`${I}/CARINO VILLA 1 MANDREM`, `${I}/MANDREM PROJECT/New folder`, `${I}/MANDREM PROJECT/VILLA CARA`],
    cover: "1.jpg",
    max: 16,
  },
  "vitalda-serenity": { dirs: [`${I}/VILTALDA SERENITY VILLA A`], cover: "6.jpg", max: 15 },
  "casa-de-almedia": { dirs: [`${I}/CASA DE ALMEDIA`], cover: "c.jpg", max: 5 },
  "la-mandarina": { dirs: [`${V}/LA MANDARINA`], cover: "369-CONF-38-DSC08280-HDR.webp", max: 13 },
  "la-selva": {
    dirs: [`${V}/LA SELVA/LA SELVA`, `${V}/LA SELVA/LA SELVA VILLA 5`, `${V}/LA SELVA/LA SELVA VILLA 8 & 6`],
    cover: "421-CONF-39-DSC_6213.avif",
    max: 16,
  },
  "la-caleta": { dirs: [`${V}/LA CALETA`], cover: "STAIRCASE.avif", max: 3 },
  "la-serrade": { dirs: [`${V}/LA SERRADE`], cover: "4a6b94c3-3af2-4f64-92c9-f0d7a01485f4.avif", max: 14 },
  "villa-luvia": { dirs: [`${V}/VILLA LUVIA`], cover: "V2-3.jpg", max: 6 },
};

/** Single images keyed by a stable name used across the site. */
const SINGLES = {
  "craft/hero": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/14.jpg", 2400],
  "craft/teak-double-door": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/9.jpg"],
  "craft/carved-door": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/4.jpg"],
  "craft/fanlight-door": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/31__6_.jpg"],
  "craft/window-seat": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/a.jpg"],
  "craft/arched-hall": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/4.webp", 2400],
  "craft/arched-living": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/5.webp", 2400],
  "craft/glazed-dining": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/5.jpg"],
  "craft/arched-lounge": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/c.jpg"],
  "craft/stairwell": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/d.jpg"],
  "craft/stair-window": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/16.webp"],
  "craft/courtyard": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/2.webp"],
  "craft/teak-stair-window": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/421-CONF-2-_DSC5662.avif"],
  "craft/verandah": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/421-CONF-39-DSC_6213.avif"],
  "craft/facade": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/1.webp"],
  "craft/corridor": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/6.webp"],
  "craft/bedroom": ["DOORS & WINDOWS/WOODEN DOORS & WINDOWS/23.webp"],
  "craft/wall-panelling": [`${I}/MANDREM PROJECT/VILLA CARA/WALL PANELLING.webp`],
  "craft/wardrobe": [`${I}/AMORA PROJECT/AMORA VILLA - F/13.jpg`],
  "craft/staircase": [`${V}/LA CALETA/STAIRCASE.avif`],
  "craft/ceiling": [`${V}/LA CALETA/WOODEN CEILING.avif`],
  "doors/laminated-1": ["DOORS & WINDOWS/LAMINATED DOORS/2.jpg"],
  "doors/laminated-2": ["DOORS & WINDOWS/LAMINATED DOORS/3.png"],
  "doors/laminated-3": ["DOORS & WINDOWS/LAMINATED DOORS/4.png"],
  "doors/laminated-4": ["DOORS & WINDOWS/LAMINATED DOORS/5.png"],
  "doors/veneer-1": ["DOORS & WINDOWS/VENEER DOORS/1.jpg"],
  "doors/veneer-2": ["DOORS & WINDOWS/VENEER DOORS/2.jpg"],
  "doors/veneer-3": ["DOORS & WINDOWS/VENEER DOORS/3.png"],
  "factory/craftsman": ["FACTORY/1.jpg"],
  "factory/frames": ["FACTORY/2.png"],
  "award/ceremony": ["MSME & AWARD/AWARD.jpeg"],
};

/** Posters for the machinery videos: crop away the text panel baked into the slides. */
const CROPS = {
  "factory/moulder": ["FACTORY/MACHINERY/GOAS FIRST AUTIMATED MOULDER MACHINE.jpg", { left: 300, top: 0, width: 497, height: 447 }],
  "factory/kiln": ["FACTORY/MACHINERY/KLIN SEASONING PLANT.jpg", { left: 290, top: 0, width: 502, height: 442 }],
};

const VIDEOS = {
  "moulder.mp4": "FACTORY/MACHINERY/MOULDER MACHINE.mp4",
  "kiln.mp4": "FACTORY/MACHINERY/KLIN SEASONING PLANT.mp4",
  "jsf-film.mp4": "JSF VIDEO/WhatsApp Video 2025-07-01 at 10.33.44 AM.mp4",
};

const slugify = (s) =>
  s.toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const manifest = {};

async function emit(key, input, { maxWidth = 1920, quality = 74, extract } = {}) {
  const dest = path.join(OUT, "images", `${key}.webp`);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  let pipe = sharp(input, { failOn: "none" }).rotate();
  if (extract) pipe = pipe.extract(extract);
  const { data, info } = await pipe
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  await fs.writeFile(dest, data);
  const tiny = await sharp(data).resize(16).webp({ quality: 40 }).toBuffer();
  manifest[key] = {
    src: `/images/${key}.webp`,
    width: info.width,
    height: info.height,
    blur: `data:image/webp;base64,${tiny.toString("base64")}`,
  };
}

async function listImages(dir) {
  const entries = await fs.readdir(path.join(SRC, dir));
  return entries
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()) && !/\(\d\)/.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => ({ name: f, abs: path.join(SRC, dir, f) }));
}

/** Evenly sample `max` items so every sub-folder (villa) is represented. */
function sample(items, max) {
  if (items.length <= max) return items;
  const step = items.length / max;
  return Array.from({ length: max }, (_, i) => items[Math.floor(i * step)]);
}

async function run() {
  await fs.rm(path.join(OUT, "images"), { recursive: true, force: true });

  for (const [slug, cfg] of Object.entries(PROJECTS)) {
    const all = (await Promise.all(cfg.dirs.map(listImages))).flat();
    const cover = all.find((f) => f.name === cfg.cover);
    if (!cover) throw new Error(`Cover ${cfg.cover} not found for ${slug}`);
    const rest = sample(all.filter((f) => f !== cover), cfg.max - 1);
    const picked = [cover, ...rest];
    for (const [i, file] of picked.entries()) {
      await emit(`projects/${slug}/${String(i + 1).padStart(2, "0")}`, file.abs, {
        maxWidth: i === 0 ? 2400 : 1800,
      });
    }
    console.log(`${slug}: ${picked.length} images`);
  }

  for (const [key, [rel, maxWidth]] of Object.entries(SINGLES)) {
    await emit(key, path.join(SRC, rel), { maxWidth: maxWidth ?? 1800 });
  }
  for (const [key, [rel, extract]] of Object.entries(CROPS)) {
    await emit(key, path.join(SRC, rel), { extract, quality: 80 });
  }

  // Client logos: keep PNG-friendly quality, constrain to a sensible size.
  for (const file of await listImages("CLIENT LOGO")) {
    await emit(`clients/${slugify(file.name)}`, file.abs, { maxWidth: 480, quality: 88 });
  }

  // Brand logo + app icons come from public/images/logo (see prepare-logo.mjs).
  manifest["brand/logo"] = await prepareLogo();

  await fs.mkdir(path.join(OUT, "videos"), { recursive: true });
  for (const [name, rel] of Object.entries(VIDEOS)) {
    await fs.copyFile(path.join(SRC, rel), path.join(OUT, "videos", name));
  }

  const body =
    "// Generated by scripts/prepare-assets.mjs — do not edit by hand.\n" +
    "export const media = " +
    JSON.stringify(manifest, null, 2) +
    " as const;\n\nexport type MediaKey = keyof typeof media;\n";
  await fs.writeFile(MANIFEST, body);
  console.log(`Wrote ${Object.keys(manifest).length} media entries.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
