"use client";

import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { getMedia } from "@/lib/media";
import { Btn } from "./ui";
import { DragArea, SortableList, toTop } from "./Sortable";

export type BuiltIn = { ref: string; src: string; width: number; height: number };
type Upload = { url: string; name: string; size: number; uploadedAt: string };

const MAX_EDGE = 2400;

/**
 * Resizes to at most 2400px on the long edge and re-encodes as WebP in the browser, so uploads are
 * small and the server needs no image tooling. The size is put in the file name for next/image.
 */
async function prepare(file: File): Promise<{ blob: Blob; width: number; height: number; name: string }> {
  const name = file.name.replace(/\.[a-z0-9]+$/i, "");
  const bitmap = await createImageBitmap(file);
  const { width: w0, height: h0 } = bitmap;
  // Animated GIFs would lose their animation on a canvas, so they go up as they are.
  if (file.type === "image/gif") {
    bitmap.close();
    return { blob: file, width: w0, height: h0, name };
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(w0, h0));
  const width = Math.round(w0 * scale);
  const height = Math.round(h0 * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
  // Keep the original if the browser can't encode WebP or re-encoding made it bigger without resizing.
  if (!blob || (scale === 1 && blob.size >= file.size && /image\/(jpeg|png|webp|avif)/.test(file.type))) {
    return { blob: file, width: w0, height: h0, name };
  }
  return { blob, width, height, name };
}

export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") throw new Error(`“${file.name}” isn’t a supported image. Use JPEG, PNG, WebP or GIF.`);
  const { blob, width, height, name } = await prepare(file);
  // Same limit as the server (hosts like Vercel refuse bodies over 4.5 MB).
  if (blob.size > 4 * 1024 * 1024) throw new Error(`“${file.name}” is over 4 MB even after compressing. Export a smaller version and try again.`);
  const body = new FormData();
  body.append("file", blob, file.name);
  body.append("name", name);
  body.append("width", String(width));
  body.append("height", String(height));
  const res = await fetch("/api/admin/media", { method: "POST", body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) throw new Error(json.error || `Upload of “${file.name}” failed. Try again.`);
  return json.url as string;
}

/* ───────────── Picker context ───────────── */

type PickOptions = { multiple?: boolean; title?: string };
type Ctx = { builtIns: BuiltIn[]; pick: (o?: PickOptions) => Promise<string[]> };
const MediaCtx = createContext<Ctx | null>(null);

export function useMedia() {
  const ctx = use(MediaCtx);
  if (!ctx) throw new Error("useMedia must be used inside <MediaProvider>");
  return ctx;
}

export function MediaProvider({ builtIns, children }: { builtIns: BuiltIn[]; children: ReactNode }) {
  const [request, setRequest] = useState<(PickOptions & { resolve: (r: string[]) => void }) | null>(null);
  const pick = useCallback((o: PickOptions = {}) => new Promise<string[]>((resolve) => setRequest({ ...o, resolve })), []);
  return (
    <MediaCtx value={{ builtIns, pick }}>
      {children}
      {request && (
        <MediaLibrary
          builtIns={builtIns}
          multiple={request.multiple}
          title={request.title}
          onClose={(refs) => {
            request.resolve(refs);
            setRequest(null);
          }}
        />
      )}
    </MediaCtx>
  );
}

/* ───────────── Library ───────────── */

export function useUploads() {
  const [uploads, setUploads] = useState<Upload[] | null>(null);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setUploads(json.uploads);
      setError("");
    } catch (e) {
      setError((e as Error).message || "Couldn’t load your uploads. Reload the page to try again.");
      setUploads([]);
    }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch of the upload list
    void refresh();
  }, [refresh]);
  return { uploads, error, refresh };
}

export function UploadButton({ onUploaded, multiple, label = "Upload images" }: { onUploaded: (urls: string[]) => void; multiple?: boolean; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="flex flex-col items-start gap-1">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (!files.length) return;
          setError("");
          const urls: string[] = [];
          for (const [i, f] of files.entries()) {
            setBusy(files.length > 1 ? `Uploading ${i + 1} of ${files.length}…` : "Uploading…");
            try {
              urls.push(await uploadImage(f));
            } catch (err) {
              setError((err as Error).message);
            }
          }
          setBusy("");
          if (urls.length) onUploaded(urls);
        }}
      />
      <Btn small variant="primary" disabled={!!busy} onClick={() => input.current?.click()}>
        {busy || `⬆ ${label}`}
      </Btn>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

function Thumb({ src, alt, selected, onClick }: { src: string; alt: string; selected?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      title={alt}
      className={`group relative aspect-square overflow-hidden rounded-md bg-neutral-100 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-neutral-900 ${
        selected ? "ring-[3px] ring-emerald-600" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- plain thumbnails in the admin */}
      <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
      {selected && <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">✓</span>}
    </button>
  );
}

function MediaLibrary({ builtIns, multiple, title, onClose }: { builtIns: BuiltIn[]; multiple?: boolean; title?: string; onClose: (refs: string[]) => void }) {
  const { uploads, error, refresh } = useUploads();
  const [tab, setTab] = useState<"uploads" | "site">("uploads");
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose([]);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [onClose]);

  const toggle = (ref: string) => {
    if (!multiple) return onClose([ref]);
    setSelected((s) => (s.includes(ref) ? s.filter((x) => x !== ref) : [...s, ref]));
  };
  const q = query.trim().toLowerCase();
  const site = builtIns.filter((b) => !q || b.ref.toLowerCase().includes(q));
  const ups = (uploads ?? []).filter((u) => !q || u.name.toLowerCase().includes(q));

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" onClick={() => onClose([])}>
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Choose an image"}
        className="flex max-h-[92svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl outline-none sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 p-4">
          <h2 className="text-base font-semibold text-neutral-900">{title ?? (multiple ? "Choose images" : "Choose an image")}</h2>
          <div className="flex items-center gap-2">
            <UploadButton
              multiple={multiple}
              onUploaded={(urls) => {
                if (!multiple) return onClose([urls[0]]);
                setSelected((s) => [...s, ...urls]);
                setTab("uploads");
                void refresh();
              }}
            />
            <Btn small variant="ghost" onClick={() => onClose([])}>
              Close
            </Btn>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3">
          {(
            [
              ["uploads", `Your uploads${uploads ? ` (${uploads.length})` : ""}`],
              ["site", `Site photos (${builtIns.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
              className={`rounded-full px-3 py-1.5 text-sm ${tab === id ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
            >
              {label}
            </button>
          ))}
          <input
            type="search"
            aria-label="Search images by name"
            placeholder="Search by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="ml-auto w-48 rounded-md border border-neutral-300 px-3 py-1.5 text-sm outline-none focus:border-neutral-900"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4" data-lenis-prevent>
          {tab === "uploads" ? (
            uploads === null ? (
              <p className="text-sm text-neutral-500">Loading your uploads…</p>
            ) : ups.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-neutral-600">{error || (q ? "No uploads match that name." : "You haven’t uploaded any images yet.")}</p>
                <p className="mt-1 text-xs text-neutral-500">Use “Upload images” above, or pick from the site photos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {ups.map((u) => (
                  <Thumb key={u.url} src={u.url} alt={u.name} selected={selected.includes(u.url)} onClick={() => toggle(u.url)} />
                ))}
              </div>
            )
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {site.map((b) => (
                <Thumb key={b.ref} src={b.src} alt={b.ref} selected={selected.includes(b.ref)} onClick={() => toggle(b.ref)} />
              ))}
            </div>
          )}
        </div>
        {multiple && (
          <div className="flex items-center justify-between gap-3 border-t border-neutral-200 p-4">
            <p className="text-sm text-neutral-600">{selected.length ? `${selected.length} selected` : "Select one or more images"}</p>
            <Btn variant="primary" disabled={!selected.length} onClick={() => onClose(selected)}>
              Add {selected.length || ""} {selected.length === 1 ? "image" : "images"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────── Fields ───────────── */

export const thumbSrc = (ref: string) => (ref ? getMedia(ref).src : "");

export function ImageField({
  label,
  value,
  onChange,
  allowEmpty = true,
  help,
  compact,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  allowEmpty?: boolean;
  help?: string;
  compact?: boolean;
}) {
  const { pick } = useMedia();
  const src = thumbSrc(value);
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-neutral-800">{label}</p>
      <div className="flex items-center gap-3">
        <div className={`${compact ? "h-16 w-16" : "h-24 w-32"} shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-100`}>
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-neutral-400">No image</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn
            small
            onClick={async () => {
              const [ref] = await pick({ title: `Choose: ${label}` });
              if (ref) onChange(ref);
            }}
          >
            {value ? "Change" : "Choose image"}
          </Btn>
          {allowEmpty && value && (
            <Btn small variant="ghost" onClick={() => onChange("")}>
              Remove
            </Btn>
          )}
        </div>
      </div>
      {help && <p className="text-xs text-neutral-500">{help}</p>}
    </div>
  );
}

/** An ordered set of images (project photos). The first one is the cover; drag a photo to reorder. */
export function ImageListField({ label, value, onChange, help }: { label: string; value: string[]; onChange: (v: string[]) => void; help?: string }) {
  const { pick } = useMedia();
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-neutral-800">
            {label} <span className="font-normal text-neutral-500">({value.length})</span>
          </p>
          <p className="text-xs text-neutral-500">{help ? `${help} ` : ""}Drag a photo to reorder; ★ makes it the cover.</p>
        </div>
        <Btn small onClick={async () => onChange([...value, ...(await pick({ multiple: true, title: `Add to ${label}` }))])}>
          + Add images
        </Btn>
      </div>
      {value.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">No images yet. Add at least one — the first is the cover.</p>
      ) : (
        <SortableList items={value} onChange={onChange} layout="grid" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" itemClassName="overflow-hidden rounded-md border border-neutral-200 bg-white">
          {(ref, i) => (
            <>
              {/* The whole photo is the drag handle (also focusable: Space, arrows, Space). */}
              <DragArea label={`Photo ${i + 1}${i === 0 ? " (cover)" : ""} — drag to reorder`} className="relative aspect-[4/3] bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                <img src={thumbSrc(ref)} alt="" loading="lazy" draggable={false} className="pointer-events-none h-full w-full select-none object-cover" />
                {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">Cover</span>}
                <span className="absolute right-1.5 top-1.5 rounded bg-black/55 px-1.5 text-sm text-white">⠿</span>
              </DragArea>
              <div className="flex items-center justify-between gap-1 p-1">
                <span className="px-1.5 text-xs tabular-nums text-neutral-400">{i + 1}</span>
                {i !== 0 && (
                  <Btn small variant="ghost" title="Make this the cover" onClick={() => onChange(toTop(value, i))}>
                    ★ Cover
                  </Btn>
                )}
                <Btn small variant="ghost" title="Remove image" className="text-red-600 hover:bg-red-50" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                  ✕
                </Btn>
              </div>
            </>
          )}
        </SortableList>
      )}
    </div>
  );
}
