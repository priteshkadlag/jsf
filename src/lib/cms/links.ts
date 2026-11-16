import type { Settings } from "./types";

export const phoneHref = (s: Settings) => `tel:+${s.phoneDigits}`;
export const whatsappHref = (s: Settings) => `https://wa.me/${s.phoneDigits}`;

/** Expands the admin's link shortcuts ("whatsapp", "phone", "email") using the site's contact details. */
export function resolveHref(href: string, s: Settings) {
  if (href === "whatsapp") return whatsappHref(s);
  if (href === "phone") return phoneHref(s);
  if (href === "email") return `mailto:${s.email}`;
  return href;
}

export const isExternal = (href: string) => /^(https?:|mailto:|tel:)/i.test(href);
