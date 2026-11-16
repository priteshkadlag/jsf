"use client";

import { useState } from "react";
import type { GalleryContent, GalleryItem, Project } from "@/lib/cms/types";
import { thumbSrc, useMedia } from "../media";
import { DragArea, DragHandle, SortableList, toBottom, toTop } from "../Sortable";
import { Btn, Card, inputCls } from "../ui";

const PAGE = 60;

export default function GalleryEditor({ value: g, onChange, projects }: { value: GalleryContent; onChange: (v: GalleryContent) => void; projects: Project[] }) {
  const { pick } = useMedia();
  const [filter, setFilter] = useState("All");
  const [newCat, setNewCat] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [fromProject, setFromProject] = useState("");

  const setItems = (items: GalleryItem[]) => onChange({ ...g, items });
  const updateItem = (i: number, patch: Partial<GalleryItem>) => setItems(g.items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const defaultCat = filter !== "All" ? filter : g.categories[0] ?? "";

  // Real indexes of the photos shown, so edits act on the full list, not the filtered view.
  const slots = g.items.flatMap((item, index) => (filter === "All" || item.category === filter ? [index] : []));
  const shownSlots = slots.slice(0, limit);
  const shown = shownSlots.map((i) => g.items[i]);

  /** Reordering inside a filtered view only swaps those photos among their own positions. */
  const reorderShown = (next: GalleryItem[]) => {
    const items = [...g.items];
    shownSlots.forEach((slot, k) => (items[slot] = next[k]));
    setItems(items);
  };
  const moveTo = (index: number, where: "top" | "bottom") => setItems(where === "top" ? toTop(g.items, index) : toBottom(g.items, index));

  const addImages = async () => {
    const refs = await pick({ multiple: true, title: "Add photos to the gallery" });
    if (refs.length) setItems([...refs.map((image) => ({ image, caption: "", category: defaultCat, href: "" })), ...g.items]);
  };
  const importProject = () => {
    const p = projects.find((x) => x.slug === fromProject);
    if (!p) return;
    const have = new Set(g.items.map((x) => x.image));
    const add = p.images.filter((im) => !have.has(im));
    const cat = g.categories.find((c) => c.toLowerCase().startsWith(p.developer.toLowerCase())) ?? defaultCat;
    setItems([...add.map((image) => ({ image, caption: p.name, category: cat, href: `/projects/${p.slug}` })), ...g.items]);
    alert(add.length ? `Added ${add.length} photo${add.length === 1 ? "" : "s"} from ${p.name}.` : `All of ${p.name}’s photos are already in the gallery.`);
  };

  return (
    <div className="space-y-6">
      <Card title="Categories" description="The filter buttons above the gallery, in this order — drag ⠿ to rearrange. Empty categories are hidden on the site.">
        <SortableList
          items={g.categories}
          onChange={(categories) => onChange({ ...g, categories })}
          layout="row"
          className="flex flex-wrap gap-2"
          itemClassName="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white py-1 pl-1 pr-1 text-sm text-neutral-800"
        >
          {(c) => (
            <>
              <DragHandle label={c} className="rounded-full px-1 text-base" />
              {c}
              <span className="text-xs text-neutral-400">({g.items.filter((x) => x.category === c).length})</span>
              <button
                type="button"
                aria-label={`Remove category ${c}`}
                onClick={() => {
                  if (confirm(`Remove the category “${c}”? Its photos stay in the gallery but lose their category.`)) onChange({ ...g, categories: g.categories.filter((x) => x !== c) });
                }}
                className="rounded-full px-1.5 text-red-600 hover:bg-red-50"
              >
                ✕
              </button>
            </>
          )}
        </SortableList>
        <form
          className="flex max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const c = newCat.trim();
            if (c && !g.categories.includes(c)) onChange({ ...g, categories: [...g.categories, c] });
            setNewCat("");
          }}
        >
          <input aria-label="New category name" placeholder="New category name" className={inputCls} value={newCat} onChange={(e) => setNewCat(e.target.value)} />
          <Btn type="submit">Add category</Btn>
        </form>
      </Card>

      <Card
        title={`Photos (${g.items.length})`}
        description="Drag a photo to change its place — the order here is the order on the Gallery page. ⤒ and ⤓ jump to the very start or end."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="Choose a project to import" className={`${inputCls} w-auto`} value={fromProject} onChange={(e) => setFromProject(e.target.value)}>
              <option value="">Import a project’s photos…</option>
              {projects.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} ({p.images.length})
                </option>
              ))}
            </select>
            <Btn small disabled={!fromProject} onClick={importProject}>
              Import
            </Btn>
            <Btn small variant="primary" onClick={addImages}>
              + Add photos
            </Btn>
          </div>
        }
      >
        <div role="group" aria-label="Show category" className="flex flex-wrap gap-2">
          {["All", ...g.categories].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => {
                setFilter(c);
                setLimit(PAGE);
              }}
              className={`rounded-full px-3 py-1 text-sm ${filter === c ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
            >
              {c}
            </button>
          ))}
        </div>
        {filter !== "All" && shown.length > 1 && <p className="text-xs text-neutral-500">Showing “{filter}” only — dragging here rearranges these photos among themselves.</p>}

        {shown.length === 0 ? (
          <p className="rounded-md border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">No photos here yet. Use “+ Add photos”.</p>
        ) : (
          <SortableList
            key={filter}
            items={shown}
            onChange={reorderShown}
            layout="grid"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            itemClassName="flex gap-2 rounded-lg border border-neutral-200 bg-white p-2"
          >
            {(item, k) => {
              const index = shownSlots[k];
              return (
                <>
                  {/* The photo is the drag handle. */}
                  <DragArea label={`Photo ${index + 1}${item.caption ? `, ${item.caption}` : ""} — drag to reorder`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                    <img src={thumbSrc(item.image)} alt="" loading="lazy" draggable={false} className="pointer-events-none h-full w-full select-none object-cover" />
                    <span className="absolute left-1 top-1 rounded bg-black/55 px-1 text-[10px] tabular-nums text-white">{index + 1}</span>
                    <span className="absolute bottom-1 right-1 rounded bg-black/55 px-1 text-xs text-white">⠿</span>
                  </DragArea>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <input aria-label="Caption" placeholder="Caption" className={`${inputCls} py-1.5`} value={item.caption} onChange={(e) => updateItem(index, { caption: e.target.value })} />
                    <select aria-label="Category" className={`${inputCls} py-1.5`} value={item.category} onChange={(e) => updateItem(index, { category: e.target.value })}>
                      <option value="">No category</option>
                      {g.categories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      <input
                        aria-label="Link (optional)"
                        placeholder="Link, e.g. /projects/amora"
                        className={`${inputCls} py-1 text-xs`}
                        value={item.href}
                        onChange={(e) => updateItem(index, { href: e.target.value })}
                      />
                      <Btn small variant="ghost" title="Move to the start of the gallery" disabled={index === 0} onClick={() => moveTo(index, "top")}>
                        ⤒
                      </Btn>
                      <Btn small variant="ghost" title="Move to the end of the gallery" disabled={index === g.items.length - 1} onClick={() => moveTo(index, "bottom")}>
                        ⤓
                      </Btn>
                      <Btn small variant="ghost" title="Remove photo" className="text-red-600 hover:bg-red-50" onClick={() => setItems(g.items.filter((_, j) => j !== index))}>
                        ✕
                      </Btn>
                    </div>
                  </div>
                </>
              );
            }}
          </SortableList>
        )}
        {slots.length > limit && (
          <Btn onClick={() => setLimit((l) => l + PAGE)}>
            Show more ({slots.length - limit} left)
          </Btn>
        )}
      </Card>
    </div>
  );
}
