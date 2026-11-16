/** Fonts the theme editor offers. Each id maps to a next/font loader in src/app/fonts.ts. */
export const DISPLAY_FONTS = [
  { id: "eb-garamond", label: "EB Garamond (default)" },
  { id: "cormorant", label: "Cormorant Garamond" },
  { id: "playfair", label: "Playfair Display" },
  { id: "dm-serif", label: "DM Serif Display" },
  { id: "fraunces", label: "Fraunces" },
  { id: "lora", label: "Lora" },
] as const;

export const BODY_FONTS = [
  { id: "manrope", label: "Manrope (default)" },
  { id: "inter", label: "Inter" },
  { id: "dm-sans", label: "DM Sans" },
  { id: "work-sans", label: "Work Sans" },
  { id: "outfit", label: "Outfit" },
  { id: "source-sans", label: "Source Sans 3" },
] as const;

export const DEFAULT_DISPLAY_FONT = "eb-garamond";
export const DEFAULT_BODY_FONT = "manrope";

/** CSS custom property each font loader exposes. */
export const fontVar = (id: string) => `--ff-${id}`;
