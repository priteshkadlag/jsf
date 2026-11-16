import { products } from "@/data/products";

/**
 * Built-in images that are part of a page's design in code (not editable content), so the admin can
 * show where they appear even though they can't be removed from there.
 * Keep in sync when a component starts or stops using a fixed image.
 */
const IN_CODE: Record<string, string[]> = {
  "craft/arched-hall": ["Home — opening door scene"],
  "factory/moulder": ["Home — factory section", "About — timeline"],
  "factory/frames": ["About — film", "About — timeline", "Craftsmanship page"],
  "award/ceremony": ["About — timeline"],
  "craft/teak-double-door": ["About — timeline"],
  "projects/moira-chapters/13": ["About — timeline"],
  "craft/stair-window": ["Craftsmanship page"],
  "craft/staircase": ["Craftsmanship page"],
  "craft/teak-stair-window": ["Craftsmanship page"],
};

export function fixedImageUses(): Record<string, string[]> {
  const out: Record<string, string[]> = Object.fromEntries(Object.entries(IN_CODE).map(([k, v]) => [k, [...v]]));
  for (const p of products) {
    for (const ref of [...p.images, ...(p.types ?? []).flatMap((t) => t.images)]) {
      const label = `Products — ${p.name}`;
      const list = (out[ref] ??= []);
      if (!list.includes(label)) list.push(label);
    }
  }
  return out;
}
