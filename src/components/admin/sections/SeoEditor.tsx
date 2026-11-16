"use client";

import { useState } from "react";
import { SEO_PAGES } from "@/lib/cms/defaults";
import type { PageSeo, Seo, Settings } from "@/lib/cms/types";
import { ImageField } from "../media";
import { Card, TextArea, TextInput, Toggle } from "../ui";

/** How the page could look in Google results (titles over ~60 and descriptions over ~160 characters get cut off). */
function SearchPreview({ title, description, url }: { title: string; description: string; url: string }) {
  const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4" aria-label="Search result preview">
      <p className="truncate text-xs text-neutral-600">{url}</p>
      <p className="mt-1 text-lg leading-snug text-[#1a0dab]">{cut(title || "(no title)", 62)}</p>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600">{cut(description || "(no description — Google will pick text from the page)", 165)}</p>
    </div>
  );
}

export default function SeoEditor({ value: s, onChange, settings }: { value: Seo; onChange: (v: Seo) => void; settings: Settings }) {
  const [path, setPath] = useState("/");
  const set = (p: Partial<Seo>) => onChange({ ...s, ...p });
  const page = s.pages[path];
  const setPage = (p: Partial<PageSeo>) => set({ pages: { ...s.pages, [path]: { ...page, ...p } } });
  const label = SEO_PAGES.find((p) => p.path === path)?.label ?? path;

  const fullTitle = path === "/" ? page.title || s.titleDefault : s.titleTemplate.replace("%s", page.title || label);

  return (
    <div className="space-y-6">
      <Card title="Site-wide defaults" description="Used on every page unless a page sets its own.">
        <TextInput
          label="Home page title"
          value={s.titleDefault}
          onChange={(titleDefault) => set({ titleDefault })}
          max={60}
          help="Shown in the browser tab and as the headline in Google results for the home page."
        />
        <TextInput
          label="Title pattern for other pages"
          value={s.titleTemplate}
          onChange={(titleTemplate) => set({ titleTemplate })}
          help={
            <>
              <code>%s</code> is replaced with each page’s title, e.g. “%s · JSF Industries”.
            </>
          }
        />
        <TextArea label="Default meta description" value={s.description} onChange={(description) => set({ description })} max={160} rows={3} />
        <TextArea
          label="Keywords"
          value={s.keywords.join(", ")}
          onChange={(v) => set({ keywords: v.split(",").map((k) => k.trimStart()) })}
          rows={3}
          help="Separate with commas. Google ignores this tag, but some other search engines still read it."
        />
        <ImageField
          label="Default share image"
          value={s.ogImage}
          onChange={(ogImage) => set({ ogImage })}
          help="Shown when a link is shared on WhatsApp, Facebook or LinkedIn. Landscape, about 1200 × 630 px."
        />
        <p className="text-xs text-neutral-500">Search Console and other verification tags, analytics and tracking codes are under Code &amp; tracking.</p>
      </Card>

      <Card title="Page by page" description="Projects and blog posts have their own SEO fields in their editors.">
        <div role="tablist" aria-label="Choose a page" className="flex flex-wrap gap-2">
          {SEO_PAGES.map((p) => (
            <button
              key={p.path}
              type="button"
              role="tab"
              aria-selected={path === p.path}
              onClick={() => setPath(p.path)}
              className={`rounded-full px-3 py-1.5 text-sm ${path === p.path ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50"}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <TextInput
              label={path === "/" ? "Meta title (leave empty to use the home page title above)" : "Meta title"}
              value={page.title}
              onChange={(title) => setPage({ title })}
              max={60}
            />
            <TextArea label="Meta description" value={page.description} onChange={(description) => setPage({ description })} max={160} rows={4} />
            <ImageField label="Share image for this page" value={page.ogImage} onChange={(ogImage) => setPage({ ogImage })} help="Leave empty to use the default share image." />
            <Toggle
              label="Hide this page from search engines"
              checked={page.noindex}
              onChange={(noindex) => setPage({ noindex })}
              help="Adds “noindex” and removes it from the sitemap. Leave off for normal pages."
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-800">Google preview</p>
            <SearchPreview title={fullTitle} description={page.description || s.description} url={`${settings.url.replace(/^https?:\/\//, "")}${path === "/" ? "" : path}`} />
          </div>
        </div>
      </Card>
    </div>
  );
}
