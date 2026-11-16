import { media, type MediaKey } from "@/data/media.generated";

export type { MediaKey };
export type MediaAsset = { src: string; width: number; height: number; blur: string };

/**
 * An image reference: either a key from the generated manifest (e.g. "craft/hero") or a URL of an
 * image uploaded through the admin (e.g. "/uploads/2026/villa-1600x900.webp" or a Vercel Blob URL).
 */
export type ImageRef = MediaKey | (string & {});

export function isMediaKey(ref: string): ref is MediaKey {
  return Object.prototype.hasOwnProperty.call(media, ref);
}

/** Uploaded files carry their size in the name ("name-1600x900.webp"), so no lookup is needed. */
const SIZE_IN_NAME = /-(\d{2,5})x(\d{2,5})\.[a-z0-9]+(?:[?#].*)?$/i;

export function getMedia(ref: ImageRef): MediaAsset {
  if (isMediaKey(ref)) return media[ref];
  const m = SIZE_IN_NAME.exec(ref ?? "");
  return { src: ref ?? "", width: m ? Number(m[1]) : 1600, height: m ? Number(m[2]) : 1067, blur: "" };
}

/** All images generated for a folder prefix, e.g. "projects/amora/". */
export function mediaByPrefix(prefix: string): MediaKey[] {
  return (Object.keys(media) as MediaKey[]).filter((k) => k.startsWith(prefix)).sort();
}

/** Every built-in image, for the admin media library. */
export function builtInMedia(): { ref: MediaKey; src: string; width: number; height: number }[] {
  return (Object.keys(media) as MediaKey[])
    .filter((k) => !k.startsWith("brand/"))
    .sort()
    .map((ref) => ({ ref, src: media[ref].src, width: media[ref].width, height: media[ref].height }));
}
