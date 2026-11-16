import {
  Cormorant_Garamond,
  DM_Sans,
  DM_Serif_Display,
  EB_Garamond,
  Fraunces,
  Inter,
  Lora,
  Manrope,
  Outfit,
  Playfair_Display,
  Source_Sans_3,
  Work_Sans,
} from "next/font/google";
import { BODY_FONTS, DEFAULT_BODY_FONT, DEFAULT_DISPLAY_FONT, DISPLAY_FONTS, fontVar } from "@/lib/cms/font-options";

/*
 * next/font needs every font declared at build time, so all theme choices are declared here.
 * Only the default pair is preloaded; the browser fetches another font's files only once the
 * theme actually uses it.
 */
const ebGaramond = EB_Garamond({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", variable: "--ff-eb-garamond" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", weight: ["400", "500", "600", "700"], variable: "--ff-cormorant", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", variable: "--ff-playfair", preload: false });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", weight: "400", variable: "--ff-dm-serif", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", variable: "--ff-fraunces", preload: false });
const lora = Lora({ subsets: ["latin"], style: ["normal", "italic"], display: "swap", variable: "--ff-lora", preload: false });

const manrope = Manrope({ subsets: ["latin"], display: "swap", variable: "--ff-manrope" });
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--ff-inter", preload: false });
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap", variable: "--ff-dm-sans", preload: false });
const workSans = Work_Sans({ subsets: ["latin"], display: "swap", variable: "--ff-work-sans", preload: false });
const outfit = Outfit({ subsets: ["latin"], display: "swap", variable: "--ff-outfit", preload: false });
const sourceSans = Source_Sans_3({ subsets: ["latin"], display: "swap", variable: "--ff-source-sans", preload: false });

export const fontVariables = [
  ebGaramond,
  cormorant,
  playfair,
  dmSerif,
  fraunces,
  lora,
  manrope,
  inter,
  dmSans,
  workSans,
  outfit,
  sourceSans,
]
  .map((f) => f.variable)
  .join(" ");

/** CSS that points the site's --font-display / --font-body at the fonts the theme picked. */
export function fontCss(display: string, body: string) {
  const d = DISPLAY_FONTS.some((f) => f.id === display) ? display : DEFAULT_DISPLAY_FONT;
  const b = BODY_FONTS.some((f) => f.id === body) ? body : DEFAULT_BODY_FONT;
  return `--font-display:var(${fontVar(d)});--font-body:var(${fontVar(b)});`;
}
