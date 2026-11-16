"use client";

import { useRef, useState } from "react";
import { formatDate } from "@/lib/cms/blog";
import { slugify } from "@/lib/cms/normalize";
import type { BlogContent, BlogPost } from "@/lib/cms/types";
import { Markdown } from "@/lib/markdown";
import { ImageField, thumbSrc, useMedia } from "../media";
import { Btn, Card, TextArea, TextInput, Toggle, inputCls } from "../ui";

const today = () => new Date().toISOString().slice(0, 10);

const blank = (): BlogPost => ({
  slug: "",
  title: "",
  excerpt: "",
  cover: "",
  date: today(),
  author: "",
  tags: [],
  body: "## A heading\n\nWrite your first paragraph here.\n\n- A bullet point\n- Another one",
  published: false,
  seoTitle: "",
  seoDescription: "",
});

const TOOLS: [icon: string, label: string][] = [
  ["H2", "Heading"],
  ["H3", "Subheading"],
  ["B", "Bold"],
  ["I", "Italic"],
  ["•", "Bullet list"],
  ["1.", "Numbered list"],
  ["❝", "Quote"],
  ["🔗", "Link"],
];

function BodyEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  const { pick } = useMedia();

  /** Wraps the selection (or inserts at the cursor) and keeps focus in the editor. */
  const apply = (before: string, after = "", placeholder = "") => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e) || placeholder;
    onChange(value.slice(0, s) + before + sel + after + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };
  const block = (prefix: string, placeholder: string) => {
    const el = ref.current;
    const s = el?.selectionStart ?? value.length;
    const needsBreak = s > 0 && value[s - 1] !== "\n" ? "\n\n" : "";
    apply(`${needsBreak}${prefix}`, "", placeholder);
  };

  const run = (label: string) => {
    switch (label) {
      case "Heading":
        return block("## ", "Heading");
      case "Subheading":
        return block("### ", "Subheading");
      case "Bold":
        return apply("**", "**", "bold text");
      case "Italic":
        return apply("*", "*", "italic text");
      case "Bullet list":
        return block("- ", "List item");
      case "Numbered list":
        return block("1. ", "List item");
      case "Quote":
        return block("> ", "Quote");
      case "Link": {
        const url = prompt("Link address (https://… or /page)");
        if (url) apply("[", `](${url})`, "link text");
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-neutral-800">Article</p>
        <div role="group" aria-label="Editor mode" className="flex rounded-md border border-neutral-300 p-0.5 text-xs">
          {(["Write", "Preview"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={(m === "Preview") === preview}
              onClick={() => setPreview(m === "Preview")}
              className={`rounded px-3 py-1 ${(m === "Preview") === preview ? "bg-neutral-900 text-white" : "text-neutral-600"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      {preview ? (
        <div className="min-h-80 rounded-md border border-neutral-200 bg-[#f1eee8] p-6 text-[#1f2a24]">
          <Markdown source={value} />
        </div>
      ) : (
        <>
          <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-1 rounded-t-md border border-b-0 border-neutral-300 bg-neutral-50 p-1">
            {TOOLS.map(([icon, label]) => (
              <button key={label} type="button" title={label} aria-label={label} onClick={() => run(label)} className="min-w-8 rounded px-2 py-1 text-sm font-semibold text-neutral-700 hover:bg-white">
                {icon}
              </button>
            ))}
            <button
              type="button"
              onClick={async () => {
                const [ref] = await pick({ title: "Insert an image" });
                if (ref) block(`![${prompt("Describe the image (alt text)") ?? ""}](${ref})\n\n`, "");
              }}
              className="rounded px-2 py-1 text-sm text-neutral-700 hover:bg-white"
            >
              🖼 Image
            </button>
          </div>
          <textarea
            ref={ref}
            aria-label="Article text"
            rows={18}
            className={`${inputCls} -mt-2 rounded-t-none font-mono text-[13px] leading-relaxed`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <p className="text-xs text-neutral-500">
            Formatting: <code>## Heading</code>, <code>**bold**</code>, <code>*italic*</code>, <code>- list</code>, <code>[text](link)</code>. Leave a blank line between paragraphs.
          </p>
        </>
      )}
    </div>
  );
}

export default function BlogEditor({ value: b, onChange }: { value: BlogContent; onChange: (v: BlogContent) => void }) {
  const [sel, setSel] = useState<number | null>(b.posts.length ? 0 : null);
  const posts = b.posts;
  const p = sel !== null ? posts[sel] : undefined;

  const setPosts = (next: BlogPost[]) => onChange({ ...b, posts: next });
  const update = (patch: Partial<BlogPost>) => setPosts(posts.map((x, i) => (i === sel ? { ...x, ...patch } : x)));
  const setTitle = (title: string) => {
    const auto = !p!.slug || p!.slug === slugify(p!.title);
    update({ title, ...(auto ? { slug: slugify(title) } : {}) });
  };

  return (
    <div className="space-y-6">
      <Card title="Blog page heading">
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput label="Heading" value={b.heading} onChange={(heading) => onChange({ ...b, heading })} />
          <TextInput label="Heading (italic second line)" value={b.accent} onChange={(accent) => onChange({ ...b, accent })} />
        </div>
        <TextArea label="Intro" value={b.intro} onChange={(intro) => onChange({ ...b, intro })} rows={2} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <Btn
            variant="primary"
            className="w-full"
            onClick={() => {
              setPosts([blank(), ...posts]);
              setSel(0);
            }}
          >
            + New article
          </Btn>
          {posts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500">No articles yet.</p>
          ) : (
            <ul className="max-h-[70svh] space-y-1 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2">
              {posts.map((x, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setSel(i)}
                    aria-current={i === sel}
                    className={`flex w-full items-center gap-3 rounded-lg p-2 text-left ${i === sel ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"}`}
                  >
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded bg-neutral-200">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                      {x.cover && <img src={thumbSrc(x.cover)} alt="" className="h-full w-full object-cover" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{x.title || "Untitled article"}</span>
                      <span className={`block text-xs ${i === sel ? "text-white/70" : x.published ? "text-emerald-700" : "text-amber-700"}`}>
                        {x.published ? "Published" : "Draft"} {x.date && `· ${formatDate(x.date)}`}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {!p ? (
          <Card>
            <p className="text-sm text-neutral-600">Choose “+ New article” to write your first post. Articles stay as drafts until you switch on “Published” and save.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card
              title={p.title || "New article"}
              actions={
                <div className="flex flex-wrap gap-2">
                  {p.published && p.slug && (
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100">
                      View live ↗
                    </a>
                  )}
                  <Btn
                    small
                    variant="danger"
                    onClick={() => {
                      if (!confirm(`Delete the article “${p.title || "Untitled"}”? It disappears from the site when you save.`)) return;
                      setPosts(posts.filter((_, i) => i !== sel));
                      setSel(posts.length > 1 ? 0 : null);
                    }}
                  >
                    Delete article
                  </Btn>
                </div>
              }
            >
              <Toggle
                label="Published"
                checked={p.published}
                onChange={(published) => update({ published })}
                help={p.published ? "Visible on the site after you save." : "Draft — only visible here."}
              />
              <TextInput label="Title" value={p.title} onChange={setTitle} />
              <div className="grid gap-5 md:grid-cols-3">
                <TextInput label="Web address (slug)" value={p.slug} onChange={(v) => update({ slug: slugify(v) || v.toLowerCase() })} help={`/blog/${p.slug || "…"}`} />
                <TextInput label="Date" type="date" value={p.date} onChange={(date) => update({ date })} />
                <TextInput label="Author" value={p.author} placeholder="JSF Industries" onChange={(author) => update({ author })} />
              </div>
              <TextInput
                label="Tags"
                value={p.tags.join(", ")}
                placeholder="Doors, Teak, Maintenance"
                onChange={(v) => update({ tags: v.split(",").map((t) => t.trimStart()) })}
                help="Separate with commas. The first tag is shown on the article card."
              />
              <TextArea label="Excerpt" value={p.excerpt} onChange={(excerpt) => update({ excerpt })} rows={2} max={200} help="A one- or two-sentence summary for the blog list." />
              <ImageField label="Cover image" value={p.cover} onChange={(cover) => update({ cover })} />
            </Card>

            <Card>
              <BodyEditor value={p.body} onChange={(body) => update({ body })} />
            </Card>

            <Card title="SEO" description="Leave empty to use the title and excerpt.">
              <TextInput label="Meta title" value={p.seoTitle} onChange={(seoTitle) => update({ seoTitle })} max={60} />
              <TextArea label="Meta description" value={p.seoDescription} onChange={(seoDescription) => update({ seoDescription })} max={160} rows={3} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
