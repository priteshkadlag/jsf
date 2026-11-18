import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { DocName } from "./types";

/*
 * Two interchangeable back ends:
 * - Local (default): JSON documents in ./content and uploads in ./content/uploads, served by the
 *   /uploads route. Works on any Node server (VPS, cPanel, Docker). Back up the content folder.
 * - Vercel Blob: used automatically when BLOB_READ_WRITE_TOKEN is set (Vercel's disk is read-only).
 */

export const storageMode = (): "blob" | "local" => (process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local");

// Runtime data, not source: tell Turbopack not to trace (and bundle) whatever this path points at.
const contentDir = () => path.resolve(/*turbopackIgnore: true*/ process.env.CMS_CONTENT_DIR || path.join(process.cwd(), "content"));
const uploadsDir = () => path.join(contentDir(), "uploads");
const BLOB_PREFIX = "cms/";

export type Upload = { url: string; name: string; size: number; uploadedAt: string };

/*
 * Blob documents are immutable: every save writes a new file (cms/<name>-<random>.json) and removes
 * the older ones, and reads find the newest file with the Blob API's list(). The Blob CDN caches
 * responses (including "not found") and ignores query strings, so overwriting one fixed file name
 * could serve a stale copy right after a save — and the site caches what it reads until the next
 * save. A file name that has never existed before can't be stale.
 */
type DocBlob = { name: string; url: string; pathname: string; uploadedAt: number };
const DOC_PATH = /^cms\/([a-z]+)(?:-[A-Za-z0-9]+)?\.json$/;

async function listDocBlobs(prefix = BLOB_PREFIX): Promise<DocBlob[]> {
  const { list } = await import("@vercel/blob");
  const out: DocBlob[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    for (const b of page.blobs) {
      const m = DOC_PATH.exec(b.pathname);
      if (m) out.push({ name: m[1], url: b.url, pathname: b.pathname, uploadedAt: new Date(b.uploadedAt).getTime() });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

async function readLocalDoc(name: DocName): Promise<unknown | undefined> {
  try {
    return JSON.parse(await fs.readFile(path.join(contentDir(), `${name}.json`), "utf8"));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") console.error(`[cms] could not read ${name}.json`, err);
    return undefined;
  }
}

/** Reads several documents at once (one Blob list call); undefined for any not saved yet. */
export async function readDocs(names: readonly DocName[]): Promise<(unknown | undefined)[]> {
  if (storageMode() !== "blob") return Promise.all(names.map(readLocalDoc));
  let blobs: DocBlob[];
  try {
    blobs = await listDocBlobs();
  } catch (err) {
    // Fail loudly: silently falling back to defaults would publish the original content.
    console.error("[cms] could not list documents in Blob", err);
    throw err;
  }
  const newest = new Map<string, DocBlob>();
  for (const b of blobs) if ((newest.get(b.name)?.uploadedAt ?? -1) < b.uploadedAt) newest.set(b.name, b);
  return Promise.all(
    names.map(async (name) => {
      const b = newest.get(name);
      if (!b) return undefined;
      const res = await fetch(b.url, { cache: "no-store" });
      if (!res.ok) throw new Error(`[cms] could not read ${b.pathname} from Blob (HTTP ${res.status})`);
      return JSON.parse(await res.text());
    }),
  );
}

export async function readDoc(name: DocName): Promise<unknown | undefined> {
  return (await readDocs([name]))[0];
}

export async function writeDoc(name: DocName, data: unknown): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  if (storageMode() === "blob") {
    const { put, del } = await import("@vercel/blob");
    const saved = await put(`${BLOB_PREFIX}${name}.json`, json, {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
      // Each file's content never changes, so it can be cached for a long time.
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    // Remove the older versions (the new file is the newest, so reads already use it).
    const old = (await listDocBlobs(`${BLOB_PREFIX}${name}`)).filter((b) => b.name === name && b.pathname !== saved.pathname);
    if (old.length) await del(old.map((b) => b.url)).catch((err) => console.error(`[cms] could not remove old versions of ${name}`, err));
    return;
  }
  await fs.mkdir(contentDir(), { recursive: true });
  const file = path.join(contentDir(), `${name}.json`);
  // Write then rename, so a crash mid-write never leaves a half-written document.
  const tmp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, json, "utf8");
  await fs.rename(tmp, file);
}

export async function deleteDoc(name: DocName): Promise<void> {
  if (storageMode() === "blob") {
    const { del } = await import("@vercel/blob");
    const all = (await listDocBlobs(`${BLOB_PREFIX}${name}`)).filter((b) => b.name === name);
    if (all.length) await del(all.map((b) => b.url));
    return;
  }
  await fs.rm(path.join(contentDir(), `${name}.json`), { force: true });
}

/*
 * Records: one JSON file per item (contact-form enquiries), so two visitors submitting at the same
 * moment can never overwrite each other. Local: content/<kind>/<id>.json. Blob: <kind>/<id>-<random>.json
 * (the random suffix keeps the public URL unguessable).
 */
const RECORD_ID = /^[a-z0-9]{8,40}$/;
const recordDir = (kind: string) => path.join(contentDir(), kind);

async function listRecordBlobs(kind: string) {
  const { list } = await import("@vercel/blob");
  const re = new RegExp(`^${kind}/([a-z0-9]+)(?:-[A-Za-z0-9]+)?\\.json$`);
  const out: { id: string; url: string }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: `${kind}/`, cursor, limit: 1000 });
    for (const b of page.blobs) {
      const m = re.exec(b.pathname);
      if (m) out.push({ id: m[1], url: b.url });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

export async function saveRecord(kind: string, id: string, data: unknown): Promise<void> {
  if (!RECORD_ID.test(id)) throw new Error("Invalid record id.");
  const json = JSON.stringify(data, null, 2);
  if (storageMode() === "blob") {
    const { put } = await import("@vercel/blob");
    await put(`${kind}/${id}.json`, json, { access: "public", addRandomSuffix: true, contentType: "application/json" });
    return;
  }
  await fs.mkdir(recordDir(kind), { recursive: true });
  const file = path.join(recordDir(kind), `${id}.json`);
  const tmp = `${file}.${randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(tmp, json, "utf8");
  await fs.rename(tmp, file);
}

export async function listRecords(kind: string): Promise<{ id: string; data: unknown }[]> {
  if (storageMode() === "blob") {
    const blobs = await listRecordBlobs(kind);
    return Promise.all(
      blobs.map(async (b) => {
        const res = await fetch(b.url, { cache: "no-store" });
        if (!res.ok) throw new Error(`[cms] could not read ${kind} ${b.id} (HTTP ${res.status})`);
        return { id: b.id, data: JSON.parse(await res.text()) };
      }),
    );
  }
  let files: string[] = [];
  try {
    files = await fs.readdir(recordDir(kind));
  } catch {
    return [];
  }
  const out: { id: string; data: unknown }[] = [];
  for (const f of files) {
    const id = f.replace(/\.json$/, "");
    if (!f.endsWith(".json") || !RECORD_ID.test(id)) continue;
    try {
      out.push({ id, data: JSON.parse(await fs.readFile(path.join(recordDir(kind), f), "utf8")) });
    } catch (err) {
      console.error(`[cms] could not read ${kind}/${f}`, err);
    }
  }
  return out;
}

export async function deleteRecords(kind: string, ids: string[]): Promise<void> {
  const wanted = new Set(ids.filter((id) => RECORD_ID.test(id)));
  if (!wanted.size) return;
  if (storageMode() === "blob") {
    const { del } = await import("@vercel/blob");
    const urls = (await listRecordBlobs(kind)).filter((b) => wanted.has(b.id)).map((b) => b.url);
    if (urls.length) await del(urls);
    return;
  }
  await Promise.all([...wanted].map((id) => fs.rm(path.join(recordDir(kind), `${id}.json`), { force: true })));
}

/** Saves an uploaded file under a unique name and returns its public URL. */
export async function saveUpload(fileName: string, bytes: Buffer, contentType: string): Promise<string> {
  const month = new Date().toISOString().slice(0, 7);
  const unique = `${randomBytes(3).toString("hex")}-${fileName}`;
  if (storageMode() === "blob") {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${month}/${unique}`, bytes, { access: "public", addRandomSuffix: false, contentType });
    return blob.url;
  }
  const dir = path.join(uploadsDir(), month);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, unique), bytes);
  return `/uploads/${month}/${unique}`;
}

export async function listUploads(): Promise<Upload[]> {
  if (storageMode() === "blob") {
    const { list } = await import("@vercel/blob");
    const out: Upload[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: "uploads/", cursor, limit: 1000 });
      for (const b of page.blobs) {
        out.push({ url: b.url, name: b.pathname.split("/").pop() ?? b.pathname, size: b.size, uploadedAt: new Date(b.uploadedAt).toISOString() });
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return out.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }
  const out: Upload[] = [];
  const root = uploadsDir();
  let months: string[] = [];
  try {
    months = await fs.readdir(root);
  } catch {
    return [];
  }
  for (const m of months) {
    const dir = path.join(root, m);
    const stat = await fs.stat(dir).catch(() => null);
    if (!stat?.isDirectory()) continue;
    for (const f of await fs.readdir(dir)) {
      const s = await fs.stat(path.join(dir, f)).catch(() => null);
      if (s?.isFile()) out.push({ url: `/uploads/${m}/${f}`, name: f, size: s.size, uploadedAt: s.mtime.toISOString() });
    }
  }
  return out.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function deleteUpload(url: string): Promise<void> {
  if (storageMode() === "blob") {
    if (!/^https:\/\/[a-z0-9.-]+\.blob\.vercel-storage\.com\//i.test(url)) throw new Error("Not an uploaded file.");
    const { del } = await import("@vercel/blob");
    await del(url);
    return;
  }
  const file = resolveUploadPath(url.replace(/^\/uploads\//, "").split("/"));
  if (!file) throw new Error("Not an uploaded file.");
  await fs.rm(file, { force: true });
}

/** Maps URL segments to a file inside the uploads folder, refusing anything that escapes it. */
export function resolveUploadPath(segments: string[]): string | null {
  if (!segments.length || segments.some((s) => !/^[a-z0-9._-]+$/i.test(s) || s === "." || s === "..")) return null;
  const root = uploadsDir();
  const file = path.resolve(root, ...segments);
  return file.startsWith(root + path.sep) ? file : null;
}
