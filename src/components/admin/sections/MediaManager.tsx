"use client";

import { useMemo, useState } from "react";
import { fixedImageUses } from "@/lib/cms/fixed-images";
import type { Content, GalleryContent, Project } from "@/lib/cms/types";
import { getMedia } from "@/lib/media";
import { UploadButton, useUploads, type BuiltIn } from "../media";
import { Btn, Card, inputCls } from "../ui";

/** Below this many pixels on the long edge a photo looks soft when shown full-screen. */
const LOW_RES = 1400;

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);
/** A small, optimised thumbnail instead of the full-size file (keeps the grid fast). */
const thumb = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=384&q=75`;

type Go = "texts" | "projects" | "gallery" | "clients" | "blog" | "seo" | "layout" | "settings";
type Use = { label: string; go?: Go; removable?: boolean };
type Item = { ref: string; src: string; name: string; width: number; height: number; kind: "website" | "upload"; size?: number };

const OTHER_DOCS: { doc: keyof Content; label: string; go: Go }[] = [
  { doc: "texts", label: "Page text & images", go: "texts" },
  { doc: "clients", label: "Clients", go: "clients" },
  { doc: "blog", label: "Blog", go: "blog" },
  { doc: "seo", label: "SEO share image", go: "seo" },
  { doc: "header", label: "Header & footer", go: "layout" },
  { doc: "settings", label: "Site info", go: "settings" },
];

function usesOf(ref: string, content: Content, fixed: Record<string, string[]>): Use[] {
  const uses: Use[] = [];
  for (const p of content.projects) {
    const i = p.images.indexOf(ref);
    if (i >= 0) uses.push({ label: `Project: ${p.name || "untitled"}${i === 0 ? " (cover)" : ""}`, go: "projects", removable: true });
  }
  const inGallery = content.gallery.items.filter((g) => g.image === ref).length;
  if (inGallery) uses.push({ label: `Gallery${inGallery > 1 ? ` ×${inGallery}` : ""}`, go: "gallery", removable: true });
  const needle = JSON.stringify(ref);
  for (const o of OTHER_DOCS) if (JSON.stringify(content[o.doc]).includes(needle)) uses.push({ label: o.label, go: o.go });
  for (const label of fixed[ref] ?? []) uses.push({ label: `${label} (fixed in page design)` });
  return uses;
}

/**
 * Every image on the website — the built-in photos and your uploads — with where each is used,
 * a low-resolution warning, one-click removal from projects and the gallery, and delete for uploads.
 */
export default function MediaManager({
  content,
  savedJson,
  builtIns,
  onProjects,
  onGallery,
  go,
}: {
  content: Content;
  savedJson: string;
  builtIns: BuiltIn[];
  onProjects: (v: Project[]) => void;
  onGallery: (v: GalleryContent) => void;
  go: (section: Go) => void;
}) {
  const { uploads, error, refresh } = useUploads();
  const fixed = useMemo(() => fixedImageUses(), []);
  const [source, setSource] = useState<"all" | "website" | "upload">("all");
  const [filter, setFilter] = useState<"all" | "low" | "unused" | "used">("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [limit, setLimit] = useState(60);

  const items: Item[] = useMemo(
    () => [
      ...(uploads ?? []).map((u) => {
        const m = getMedia(u.url);
        return { ref: u.url, src: u.url, name: u.name, width: m.width, height: m.height, kind: "upload" as const, size: u.size };
      }),
      ...builtIns.map((b) => ({ ref: b.ref, src: b.src, name: b.ref, width: b.width, height: b.height, kind: "website" as const })),
    ],
    [uploads, builtIns],
  );

  const rows = useMemo(
    () =>
      items.map((it) => {
        const uses = usesOf(it.ref, content, fixed);
        // Logos are always shown small, so only photos get the warning.
        return { ...it, uses, low: !it.ref.startsWith("clients/") && Math.max(it.width, it.height) < LOW_RES };
      }),
    [items, content, fixed],
  );

  const counts = {
    low: rows.filter((r) => r.low && r.uses.length).length,
    unused: rows.filter((r) => !r.uses.length).length,
  };
  const q = query.trim().toLowerCase();
  const shown = rows.filter(
    (r) =>
      (source === "all" || r.kind === source) &&
      (filter === "all" || (filter === "low" && r.low && r.uses.length) || (filter === "unused" && !r.uses.length) || (filter === "used" && r.uses.length)) &&
      (!q || r.name.toLowerCase().includes(q) || r.uses.some((u) => u.label.toLowerCase().includes(q))),
  );

  const removeFromSite = (ref: string, name: string) => {
    const projects = content.projects.filter((p) => p.images.includes(ref));
    const emptied = projects.filter((p) => p.images.length === 1).map((p) => p.name);
    const covers = projects.filter((p) => p.images[0] === ref && p.images.length > 1).map((p) => p.name);
    const gallery = content.gallery.items.filter((g) => g.image === ref).length;
    const parts = [projects.length && `${projects.length} project${projects.length === 1 ? "" : "s"}`, gallery && "the gallery"].filter(Boolean).join(" and ");
    const notes = [
      covers.length && `The next photo becomes the cover of: ${covers.join(", ")}.`,
      emptied.length && `${emptied.join(", ")} will have no photos left and will be hidden from the site.`,
    ]
      .filter(Boolean)
      .join("\n");
    if (!confirm(`Remove “${name}” from ${parts}?${notes ? `\n\n${notes}` : ""}\n\nPress “Save changes” afterwards to update the website.`)) return;
    if (projects.length) onProjects(content.projects.map((p) => (p.images.includes(ref) ? { ...p, images: p.images.filter((i) => i !== ref) } : p)));
    if (gallery) onGallery({ ...content.gallery, items: content.gallery.items.filter((g) => g.image !== ref) });
  };

  const deleteUpload = async (ref: string, name: string, used: boolean) => {
    const msg = used
      ? `“${name}” is still used on the site. Deleting the file leaves a broken image there. Delete anyway?`
      : `Delete “${name}” permanently?`;
    if (!confirm(msg)) return;
    setBusy(ref);
    const res = await fetch(`/api/admin/media?url=${encodeURIComponent(ref)}`, { method: "DELETE" });
    setBusy("");
    if (!res.ok) alert("That image couldn’t be deleted. Reload and try again.");
    void refresh();
  };

  const chip = (active: boolean) => `rounded-full px-3 py-1 text-sm ${active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`;

  return (
    <div className="space-y-6">
      <Card
        title="All images"
        description={
          <>
            Every photo on the website and every image you’ve uploaded. Use <strong>Remove from site</strong> to take a photo out of all projects and the gallery
            at once, then press <strong>Save changes</strong>. Built-in photos can’t be deleted — they’re part of the website — but they disappear from
            pages once nothing uses them.
          </>
        }
        actions={<UploadButton multiple onUploaded={() => void refresh()} />}
      >
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Source" className="flex flex-wrap gap-1">
            {(
              [
                ["all", `All (${rows.length})`],
                ["website", `Website photos (${builtIns.length})`],
                ["upload", `Uploaded (${uploads?.length ?? "…"})`],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" aria-pressed={source === k} onClick={() => setSource(k)} className={chip(source === k)}>
                {label}
              </button>
            ))}
          </div>
          <span className="mx-1 hidden h-5 w-px bg-neutral-200 sm:block" />
          <div role="group" aria-label="Show" className="flex flex-wrap gap-1">
            {(
              [
                ["all", "Any use"],
                ["used", "In use"],
                ["low", `Low resolution, in use (${counts.low})`],
                ["unused", `Not used (${counts.unused})`],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)} className={chip(filter === k)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <input aria-label="Search images" placeholder="Search by name, project or page…" className={`${inputCls} max-w-sm`} value={query} onChange={(e) => setQuery(e.target.value)} />
        <p className="text-xs text-neutral-500">
          <span className="font-medium text-amber-700">Low resolution</span> means the original photo is under {LOW_RES} px wide — fine in small spots, soft when
          shown full-screen. Replace it with a larger original (2000 px or more) when you have one.
        </p>

        {uploads === null && source !== "website" ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="rounded-md border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">No images match.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.slice(0, limit).map((r) => {
              const removable = r.uses.some((u) => u.removable);
              const usedInSaved = savedJson.includes(JSON.stringify(r.ref));
              return (
                <li key={r.ref} className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                    <img src={thumb(r.src)} alt={r.name} loading="lazy" className="aspect-[4/3] w-full bg-neutral-100 object-cover" />
                    <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white">{r.kind === "upload" ? "Uploaded" : "Website"}</span>
                    {r.low && <span className="absolute right-2 top-2 rounded bg-amber-500 px-1.5 py-0.5 text-[11px] font-medium text-white">Low resolution</span>}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <div>
                      <p className="truncate text-sm font-medium text-neutral-900" title={r.name}>
                        {r.name}
                      </p>
                      <p className="text-xs tabular-nums text-neutral-500">
                        {r.width} × {r.height} px{r.size ? ` · ${kb(r.size)}` : ""}
                      </p>
                    </div>
                    {r.uses.length ? (
                      <ul className="flex flex-wrap gap-1">
                        {r.uses.map((u, i) => (
                          <li key={i}>
                            {u.go ? (
                              <button
                                type="button"
                                onClick={() => go(u.go!)}
                                className="rounded bg-emerald-50 px-1.5 py-0.5 text-left text-xs text-emerald-800 hover:bg-emerald-100"
                                title="Open this section"
                              >
                                {u.label}
                              </button>
                            ) : (
                              <span className="block rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">{u.label}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-neutral-400">Not used on the site</p>
                    )}
                    <div className="mt-auto flex flex-wrap gap-1 pt-1">
                      {removable && (
                        <Btn small variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => removeFromSite(r.ref, r.name)}>
                          Remove from site
                        </Btn>
                      )}
                      {r.kind === "upload" && (
                        <Btn small variant="ghost" className="text-red-600 hover:bg-red-50" disabled={busy === r.ref} onClick={() => deleteUpload(r.ref, r.name, usedInSaved || r.uses.length > 0)}>
                          Delete file
                        </Btn>
                      )}
                      <a href={r.src} target="_blank" rel="noreferrer" className="rounded-md px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100">
                        Open full size ↗
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {shown.length > limit && <Btn onClick={() => setLimit((l) => l + 60)}>Show more ({shown.length - limit} left)</Btn>}
      </Card>
    </div>
  );
}
