import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { defaultContent } from "./defaults";
import { normalizeDoc } from "./normalize";
import { readDocs } from "./storage";
import { DOC_NAMES, type Content, type DocName } from "./types";

export const CMS_TAG = "cms";

/** Reads every document from storage, falling back to the built-in defaults for anything not yet edited. */
export async function loadContent(): Promise<Content> {
  const defaults = defaultContent();
  const docs = await readDocs(DOC_NAMES);
  const out = { ...defaults } as Record<DocName, unknown>;
  DOC_NAMES.forEach((name, i) => {
    if (docs[i] !== undefined) out[name] = normalizeDoc(name, docs[i], defaults);
  });
  return out as Content;
}

/**
 * Content for the public site. Cached so every page stays statically prerendered; saving in the
 * admin calls updateTag(CMS_TAG), and the next visit rebuilds the affected pages with fresh content.
 */
export async function getContent(): Promise<Content> {
  "use cache";
  cacheTag(CMS_TAG);
  cacheLife("max");
  return loadContent();
}
