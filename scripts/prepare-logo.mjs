// Builds the website logo files and app icons from the official JSF logo SVGs in public/images/logo:
//   JSF-Logo-For-Light-Backgrounds.svg  (green lettering, gold arch)
//   JSF-Logo-For-Dark-Backgrounds.svg   (cream lettering, gold arch)
// Outputs (public/brand):
//   jsf-logo-dark.svg / .png        full logo for light backgrounds (header fallback, Google, sharing)
//   jsf-logo-light.svg / .png       full logo for dark backgrounds (menu, footer)
//   jsf-logo-dark-compact.svg       without the "Doors · Windows · Interiors" line, for small sizes
//   jsf-logo-light-compact.svg
// and src/app/icon.png, apple-icon.png, favicon.ico (arch + JSF on the brand green).
// Run standalone with: node scripts/prepare-logo.mjs (also called by prepare-assets.mjs).
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "public", "images", "logo");
const OUT = path.join(ROOT, "public", "brand");
const APP = path.join(ROOT, "src", "app");
const GREEN = "#30463A";

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

const viewBoxOf = (svg) => svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const withViewBox = (svg, [x, y, w, h]) =>
  svg
    .replace(/viewBox="[^"]+"/, `viewBox="${x} ${y} ${w} ${h}"`)
    .replace(/width="[^"]+"/, `width="${w}"`)
    .replace(/height="[^"]+"/, `height="${h}"`);
/** The tagline is the last shape in the file (gold lettering under INDUSTRIES). */
const withoutTagline = (svg) => {
  const i = svg.lastIndexOf("<path");
  return svg.slice(0, i) + svg.slice(svg.indexOf("/>", i) + 2);
};

/** Tightens the viewBox to the drawn artwork (plus a little breathing room). */
async function crop(svg, pad = 6) {
  const [x, y] = viewBoxOf(svg);
  const scale = 2;
  const { info } = await sharp(Buffer.from(svg), { density: 72 * scale })
    .trim({ threshold: 1 })
    .toBuffer({ resolveWithObject: true });
  const left = x + -info.trimOffsetLeft / scale - pad;
  const top = y + -info.trimOffsetTop / scale - pad;
  const box = [left, top, info.width / scale + pad * 2, info.height / scale + pad * 2].map((n) => Math.round(n * 10) / 10);
  return withViewBox(svg, box);
}

export async function prepareLogo() {
  const dark = await fs.readFile(path.join(SRC, "JSF-Logo-For-Light-Backgrounds.svg"), "utf8");
  const light = await fs.readFile(path.join(SRC, "JSF-Logo-For-Dark-Backgrounds.svg"), "utf8");
  await fs.mkdir(OUT, { recursive: true });

  const files = {
    "jsf-logo-dark.svg": await crop(dark),
    "jsf-logo-light.svg": await crop(light),
    "jsf-logo-dark-compact.svg": await crop(withoutTagline(dark)),
    "jsf-logo-light-compact.svg": await crop(withoutTagline(light)),
  };
  for (const [name, svg] of Object.entries(files)) await fs.writeFile(path.join(OUT, name), svg);

  // PNG copies for places that don't take SVG (Google's business logo, social sharing).
  for (const tone of ["dark", "light"]) {
    await sharp(Buffer.from(files[`jsf-logo-${tone}.svg`]), { density: 288 })
      .resize({ width: 1200 })
      .png()
      .toFile(path.join(OUT, `jsf-logo-${tone}.png`));
  }

  // App icons: just the arch and "JSF" (the smaller words can't be read at icon sizes), cream and
  // gold on the brand green.
  const markSvg = await crop(light.replace(/<path[^>]*d="M306\.497[\s\S]*$/, "</svg>"), 4);
  const mark = await sharp(Buffer.from(markSvg), { density: 288 }).png().toBuffer();
  // (sharp always flattens before resizing, so compose onto a solid square instead.)
  const icon = async (size, pad) => {
    const inner = await sharp(mark).resize(size - pad * 2, size - pad * 2, { fit: "inside" }).png().toBuffer();
    return sharp({ create: { width: size, height: size, channels: 4, background: GREEN } }).composite([{ input: inner, gravity: "centre" }]);
  };

  await (await icon(512, 72)).png().toFile(path.join(APP, "icon.png"));
  await (await icon(180, 26)).png().toFile(path.join(APP, "apple-icon.png"));
  const icoPngs = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await (await icon(size, Math.round(size * 0.08))).png().toBuffer() })));
  await fs.writeFile(path.join(APP, "favicon.ico"), toIco(icoPngs));

  const [, , width, height] = viewBoxOf(files["jsf-logo-dark-compact.svg"]);
  return { src: "/brand/jsf-logo-dark-compact.svg", width: Math.round(width), height: Math.round(height), blur: "" };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const entry = await prepareLogo();
  console.log("brand/logo", entry);
}
