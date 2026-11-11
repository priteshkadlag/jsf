// Builds the header/footer logo variants (JSF HORIZONTAL.png) and app icons (JSF STACKED LOGO.png)
// from public/images/logo.
// Run standalone with: node scripts/prepare-logo.mjs (also called by prepare-assets.mjs).
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const LOGO_SRC = path.join(ROOT, "public", "images", "logo", "JSF HORIZONTAL.png");
const MARK_SRC = path.join(ROOT, "public", "images", "logo", "JSF STACKED LOGO.png");
const OUT = path.join(ROOT, "public", "brand");
const APP = path.join(ROOT, "src", "app");
const IVORY = { r: 0xe8, g: 0xe3, b: 0xdb };
const PAPER = "#f1eee8";

/** Wraps PNG buffers in an .ico container (PNG-in-ICO is supported by all modern browsers). */
function toIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach(({ size, data }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o);
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.data)]);
}

export async function prepareLogo() {
  const { data: raw, info } = await sharp(LOGO_SRC).trim().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const rawOpts = { raw: { width, height, channels: 4 } };

  // Dark = the original walnut-brown artwork; light = same alpha, recoloured ivory for dark backgrounds.
  const light = Buffer.from(raw);
  for (let i = 0; i < raw.length; i += 4) {
    light[i] = IVORY.r;
    light[i + 1] = IVORY.g;
    light[i + 2] = IVORY.b;
  }
  await fs.mkdir(OUT, { recursive: true });
  await sharp(raw, rawOpts).png().toFile(path.join(OUT, "jsf-logo-dark.png"));
  await sharp(light, rawOpts).png().toFile(path.join(OUT, "jsf-logo-light.png"));

  // Icon mark: the arched door from the stacked logo (skip the "19 89" numerals and the wordmark below).
  const { data: markRaw, info: m } = await sharp(MARK_SRC).trim().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const left = Math.round(m.width * 0.25);
  const right = Math.round(m.width * 0.75);
  const bottom = Math.round(m.height * 0.84);
  const mark = await sharp(markRaw, { raw: { width: m.width, height: m.height, channels: 4 } })
    .extract({ left, top: 0, width: right - left, height: bottom })
    .trim()
    .png()
    .toBuffer();
  const square = (size, pad) =>
    sharp(mark)
      .resize(size - pad * 2, size - pad * 2, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } });

  await square(512, 24).png().toFile(path.join(APP, "icon.png"));
  await square(180, 22).flatten({ background: PAPER }).png().toFile(path.join(APP, "apple-icon.png"));
  const icoPngs = await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, data: await square(size, size >= 32 ? 1 : 0).png().toBuffer() })),
  );
  await fs.writeFile(path.join(APP, "favicon.ico"), toIco(icoPngs));

  return { src: "/brand/jsf-logo-dark.png", width, height, blur: "" };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const entry = await prepareLogo();
  console.log("brand/logo", entry);
}
