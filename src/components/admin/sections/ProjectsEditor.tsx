"use client";

import { useState } from "react";
import { slugify } from "@/lib/cms/normalize";
import type { Project } from "@/lib/cms/types";
import { ImageListField, thumbSrc } from "../media";
import { DragHandle, SortableList, toTop } from "../Sortable";
import { Btn, Card, TextArea, TextInput, TitledListEditor, Toggle } from "../ui";

const blank = (): Project => ({
  slug: "",
  name: "",
  developer: "",
  location: "Goa",
  scope: "",
  scale: "",
  summary: "",
  body: [],
  features: [],
  images: [],
  featured: false,
  seoTitle: "",
  seoDescription: "",
});

export default function ProjectsEditor({ value, onChange }: { value: Project[]; onChange: (v: Project[]) => void }) {
  const [sel, setSel] = useState(0);
  const [query, setQuery] = useState("");
  const p = value[sel];
  const developers = [...new Set(value.map((x) => x.developer).filter(Boolean))];

  const update = (patch: Partial<Project>) => onChange(value.map((x, i) => (i === sel ? { ...x, ...patch } : x)));
  const setName = (name: string) => {
    // The slug follows the name until someone edits it by hand.
    const auto = !p.slug || p.slug === slugify(p.name);
    update({ name, ...(auto ? { slug: slugify(name) } : {}) });
  };
  const slugTaken = !!p && value.some((x, i) => i !== sel && x.slug === p.slug);
  const q = query.trim().toLowerCase();
  const renderRow = (x: Project, i: number, draggable = false) => (
    <div className={`flex items-center gap-1 rounded-lg ${i === sel ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"}`}>
      {draggable && <DragHandle label={x.name || "project"} className={`self-stretch ${i === sel ? "text-white/60 hover:bg-white/10 hover:text-white" : ""}`} />}
      <button type="button" onClick={() => setSel(i)} aria-current={i === sel} className={`flex min-w-0 flex-1 items-center gap-3 p-2 text-left ${draggable ? "pl-0" : ""}`}>
        <span className="h-10 w-10 shrink-0 overflow-hidden rounded bg-neutral-200">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
          {x.images[0] && <img src={thumbSrc(x.images[0])} alt="" className="h-full w-full object-cover" />}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{x.name || "Untitled project"}</span>
          <span className={`block truncate text-xs ${i === sel ? "text-white/70" : "text-neutral-500"}`}>
            {[x.developer, x.featured ? "★ Home page" : "", x.images.length ? "" : "Hidden: no images"].filter(Boolean).join(" · ")}
          </span>
        </span>
      </button>
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
        <div className="flex gap-2">
          <input
            type="search"
            aria-label="Search projects"
            placeholder="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <Btn
            variant="primary"
            onClick={() => {
              onChange([blank(), ...value]);
              setSel(0);
              setQuery("");
            }}
          >
            + New
          </Btn>
        </div>
        <div className="max-h-[70svh] overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2">
          {q ? (
            // While searching, the list is filtered, so dragging is off.
            <ul className="space-y-1">
              {value.map((x, i) => (`${x.name} ${x.developer} ${x.location}`.toLowerCase().includes(q) ? <li key={i}>{renderRow(x, i)}</li> : null))}
            </ul>
          ) : (
            <SortableList
              items={value}
              className="space-y-1"
              onChange={(next, { from, to }) => {
                onChange(next);
                // Keep the open project selected after it (or a neighbour) moves.
                setSel((s) => (s === from ? to : from < s && to >= s ? s - 1 : from > s && to <= s ? s + 1 : s));
              }}
            >
              {(x, i) => renderRow(x, i, true)}
            </SortableList>
          )}
        </div>
        <p className="text-xs text-neutral-500">Drag ⠿ to reorder — this is the order on the Projects page.</p>
      </aside>

      {!p ? (
        <Card>
          <p className="text-sm text-neutral-600">No projects yet. Choose “+ New” to add your first one.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card
            title={p.name || "New project"}
            actions={
              <div className="flex flex-wrap gap-2">
                <Btn small disabled={sel === 0} title="Show this project first on the Projects page" onClick={() => (onChange(toTop(value, sel)), setSel(0))}>
                  ⤒ Move to top
                </Btn>
                {p.slug && p.images.length > 0 && (
                  <a href={`/projects/${p.slug}`} target="_blank" rel="noreferrer" className="rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100">
                    View live ↗
                  </a>
                )}
                <Btn
                  small
                  variant="danger"
                  onClick={() => {
                    if (!confirm(`Delete the project “${p.name || "Untitled"}”? It disappears from the site when you save.`)) return;
                    onChange(value.filter((_, i) => i !== sel));
                    setSel(Math.max(0, sel - 1));
                  }}
                >
                  Delete project
                </Btn>
              </div>
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              <TextInput label="Project name" value={p.name} onChange={setName} />
              <div>
                <TextInput
                  label="Web address (slug)"
                  value={p.slug}
                  onChange={(v) => update({ slug: slugify(v) || v.toLowerCase() })}
                  help={`Page: /projects/${p.slug || "…"}. Changing this breaks links people already shared.`}
                />
                {slugTaken && <p className="mt-1 text-xs font-medium text-red-700">Another project already uses this address. A number will be added when you save.</p>}
              </div>
              <div>
                <TextInput label="Developer / client" value={p.developer} onChange={(developer) => update({ developer })} help="Projects are grouped and filtered by this name." />
                {developers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {developers.map((d) => (
                      <button key={d} type="button" onClick={() => update({ developer: d })} className="rounded-full border border-neutral-300 px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100">
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <TextInput label="Location" value={p.location} onChange={(location) => update({ location })} />
              <TextInput label="Scope of work" value={p.scope} placeholder="Wooden doors & windows" onChange={(scope) => update({ scope })} />
              <TextInput label="Scale (optional)" value={p.scale} placeholder="10 villas" onChange={(scale) => update({ scale })} />
            </div>
            <Toggle label="Show on the home page" checked={p.featured} onChange={(featured) => update({ featured })} help="Featured projects appear in the “Selected projects” strip." />
          </Card>

          <Card title="Photos">
            <ImageListField label="Project photos" value={p.images} onChange={(images) => update({ images })} help="The first photo is the cover. Projects without photos are hidden from the site." />
          </Card>

          <Card title="Description">
            <TextArea label="Summary" value={p.summary} onChange={(summary) => update({ summary })} rows={2} max={220} help="One or two sentences, shown under the title." />
            <TextArea
              label="Story"
              value={p.body.join("\n\n")}
              onChange={(v) => update({ body: v.split(/\n{2,}/) })}
              rows={8}
              help="Leave a blank line between paragraphs. The first paragraph is shown large."
            />
            <TitledListEditor label="Highlights (optional)" value={p.features} onChange={(features) => update({ features })} itemName="highlight" />
          </Card>

          <Card title="SEO" description="Leave empty to build them from the name, scope and summary.">
            <TextInput label="Meta title" value={p.seoTitle} onChange={(seoTitle) => update({ seoTitle })} max={60} />
            <TextArea label="Meta description" value={p.seoDescription} onChange={(seoDescription) => update({ seoDescription })} max={160} rows={3} />
          </Card>
        </div>
      )}
    </div>
  );
}
