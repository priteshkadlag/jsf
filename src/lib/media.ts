import { media, type MediaKey } from "@/data/media.generated";

export type { MediaKey };
export type MediaAsset = { src: string; width: number; height: number; blur: string };

export function getMedia(key: MediaKey): MediaAsset {
  return media[key];
}

/** All images generated for a folder prefix, e.g. "projects/amora/". */
export function mediaByPrefix(prefix: string): MediaKey[] {
  return (Object.keys(media) as MediaKey[]).filter((k) => k.startsWith(prefix)).sort();
}
