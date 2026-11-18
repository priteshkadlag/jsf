"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { logout, resetDoc, saveDoc } from "@/app/admin/actions";
import { publishedPosts } from "@/lib/cms/blog";
import type { Content, DocName } from "@/lib/cms/types";
import { MediaProvider, type BuiltIn } from "./media";
import { Btn, Card } from "./ui";
import SettingsEditor from "./sections/SettingsEditor";
import TextsEditor from "./sections/TextsEditor";
import ProjectsEditor from "./sections/ProjectsEditor";
import GalleryEditor from "./sections/GalleryEditor";
import ClientsEditor from "./sections/ClientsEditor";
import BlogEditor from "./sections/BlogEditor";
import SeoEditor from "./sections/SeoEditor";
import HeaderFooterEditor from "./sections/HeaderFooterEditor";
import ThemeEditor from "./sections/ThemeEditor";
import MediaManager from "./sections/MediaManager";
import IntegrationsEditor from "./sections/IntegrationsEditor";
import EnquiriesManager from "./sections/EnquiriesManager";
import type { StoredEnquiry } from "@/lib/enquiries";

type SectionId = "overview" | "enquiries" | "integrations" | "settings" | "texts" | "projects" | "gallery" | "clients" | "blog" | "seo" | "layout" | "theme" | "media";

const SECTIONS: { id: SectionId; label: string; icon: string; docs: DocName[]; intro: string }[] = [
  { id: "overview", label: "Overview", icon: "◎", docs: [], intro: "What’s on the site and where to change it." },
  { id: "enquiries", label: "Enquiries", icon: "✉", docs: [], intro: "Messages from the website’s contact form. Reply, delete or export them as a CSV file." },
  { id: "texts", label: "Page text & images", icon: "✎", docs: ["texts"], intro: "Headings, paragraphs, buttons and section images on every page." },
  { id: "projects", label: "Projects", icon: "▦", docs: ["projects"], intro: "Add, edit, reorder or remove projects and their photos." },
  { id: "gallery", label: "Gallery", icon: "◫", docs: ["gallery"], intro: "Photos and categories on the Gallery page." },
  { id: "clients", label: "Clients", icon: "◇", docs: ["clients"], intro: "Client logos and the key partner cards." },
  { id: "blog", label: "Blog", icon: "✍", docs: ["blog"], intro: "Write, publish and manage articles." },
  { id: "seo", label: "SEO", icon: "⌕", docs: ["seo"], intro: "Meta titles, descriptions and share images for search and social." },
  { id: "integrations", label: "Code & tracking", icon: "</>", docs: ["integrations"], intro: "PageSpeed test, analytics, verification tags and custom code." },
  { id: "layout", label: "Header & footer", icon: "☰", docs: ["header", "footer"], intro: "Menu links, buttons, logos and footer text." },
  { id: "theme", label: "Theme", icon: "◐", docs: ["theme"], intro: "Colours and fonts used across the site." },
  { id: "settings", label: "Site info", icon: "ⓘ", docs: ["settings"], intro: "Business name, contact details, address and award." },
  { id: "media", label: "Media library", icon: "▣", docs: ["projects", "gallery"], intro: "Every image on the site: where it’s used, low-resolution warnings, remove or delete." },
];

type Status = { kind: "idle" } | { kind: "saved"; at: string } | { kind: "error"; message: string };

export default function AdminApp({
  initial,
  builtIns,
  storage,
  initialSection,
  enquiries,
  enquiriesError,
}: {
  initial: Content;
  builtIns: BuiltIn[];
  storage: "local" | "blob";
  initialSection?: string;
  enquiries: StoredEnquiry[];
  enquiriesError?: string;
}) {
  const [content, setContent] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [active, setActive] = useState<SectionId>(SECTIONS.find((s) => s.id === initialSection)?.id ?? "overview");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [navOpen, setNavOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const dirtyDocs = useMemo(
    () => new Set((Object.keys(content) as DocName[]).filter((k) => JSON.stringify(content[k]) !== JSON.stringify(saved[k]))),
    [content, saved],
  );
  const section = SECTIONS.find((s) => s.id === active)!;
  const sectionDirty = section.docs.filter((d) => dirtyDocs.has(d));

  useEffect(() => {
    if (!dirtyDocs.size) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyDocs.size]);

  const set = <K extends DocName>(name: K) => (v: Content[K]) => {
    setContent((c) => ({ ...c, [name]: v }));
    setStatus({ kind: "idle" });
  };

  const save = () =>
    startTransition(async () => {
      for (const name of sectionDirty) {
        const res = await saveDoc(name, content[name]);
        if (!res.ok) {
          setStatus({ kind: "error", message: res.error });
          return;
        }
        // Store what the server kept (cleaned links, unique slugs…) so the editor matches the site.
        setContent((c) => ({ ...c, [name]: res.data }));
        setSaved((c) => ({ ...c, [name]: res.data }));
      }
      setStatus({ kind: "saved", at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    });

  const discard = () => {
    if (!confirm(`Discard your unsaved changes to ${section.label}?`)) return;
    setContent((c) => ({ ...c, ...Object.fromEntries(section.docs.map((d) => [d, saved[d]])) }));
    setStatus({ kind: "idle" });
  };

  const restore = () => {
    if (!confirm(`Restore ${section.label} to the website’s original content? Everything you’ve saved in this section will be replaced. This can’t be undone.`)) return;
    startTransition(async () => {
      for (const name of section.docs) {
        const res = await resetDoc(name);
        if (!res.ok) {
          setStatus({ kind: "error", message: res.error });
          return;
        }
        setContent((c) => ({ ...c, [name]: res.data }));
        setSaved((c) => ({ ...c, [name]: res.data }));
      }
      setStatus({ kind: "saved", at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
    });
  };

  const go = (id: SectionId) => {
    setActive(id);
    setNavOpen(false);
    setStatus({ kind: "idle" });
    window.scrollTo({ top: 0 });
  };

  let body: ReactNode;
  switch (active) {
    case "enquiries":
      body = <EnquiriesManager initial={enquiries} loadError={enquiriesError} />;
      break;
    case "settings":
      body = <SettingsEditor value={content.settings} onChange={set("settings")} />;
      break;
    case "texts":
      body = <TextsEditor value={content.texts} onChange={set("texts")} />;
      break;
    case "projects":
      body = <ProjectsEditor value={content.projects} onChange={set("projects")} />;
      break;
    case "gallery":
      body = <GalleryEditor value={content.gallery} onChange={set("gallery")} projects={content.projects} />;
      break;
    case "clients":
      body = <ClientsEditor value={content.clients} onChange={set("clients")} developers={[...new Set(content.projects.map((p) => p.developer).filter(Boolean))]} />;
      break;
    case "blog":
      body = <BlogEditor value={content.blog} onChange={set("blog")} />;
      break;
    case "seo":
      body = <SeoEditor value={content.seo} onChange={set("seo")} settings={content.settings} />;
      break;
    case "integrations":
      body = <IntegrationsEditor value={content.integrations} onChange={set("integrations")} siteUrl={saved.settings.url} />;
      break;
    case "layout":
      body = <HeaderFooterEditor header={content.header} footer={content.footer} onHeader={set("header")} onFooter={set("footer")} />;
      break;
    case "theme":
      body = <ThemeEditor value={content.theme} onChange={set("theme")} />;
      break;
    case "media":
      body = (
        <MediaManager
          content={content}
          savedJson={JSON.stringify(saved)}
          builtIns={builtIns}
          onProjects={set("projects")}
          onGallery={set("gallery")}
          go={go}
        />
      );
      break;
    default:
      body = <Overview content={saved} storage={storage} go={go} enquiries={enquiries.length} />;
  }

  return (
    <MediaProvider builtIns={builtIns}>
      <div className="min-h-svh bg-neutral-100 font-sans text-neutral-900">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md p-2 text-neutral-700 hover:bg-neutral-100 lg:hidden"
              aria-label={navOpen ? "Close sections menu" : "Open sections menu"}
              aria-expanded={navOpen}
              onClick={() => setNavOpen((v) => !v)}
            >
              ☰
            </button>
            <span className="truncate text-sm font-semibold">
              <span className="hidden sm:inline">{content.settings.name} · </span>Admin
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 whitespace-nowrap sm:gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="rounded-md px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100">
              View site ↗
            </a>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
                onClick={(e) => {
                  if (dirtyDocs.size && !confirm("You have unsaved changes. Sign out and lose them?")) e.preventDefault();
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <nav
            aria-label="Admin sections"
            className={`fixed inset-y-0 left-0 top-14 z-30 w-64 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white p-3 transition-transform lg:sticky lg:h-[calc(100svh-3.5rem)] lg:translate-x-0 ${
              navOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
            }`}
          >
            <ul className="space-y-0.5">
              {SECTIONS.map((s) => {
                const dirty = s.docs.some((d) => dirtyDocs.has(d));
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => go(s.id)}
                      aria-current={active === s.id ? "page" : undefined}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                        active === s.id ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <span aria-hidden="true" className="w-5 shrink-0 text-center text-xs">
                        {s.icon}
                      </span>
                      <span className="flex-1">{s.label}</span>
                      {dirty && <span className="h-2 w-2 rounded-full bg-amber-500" title="Unsaved changes" aria-label="Unsaved changes" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          {navOpen && <div className="fixed inset-0 top-14 z-20 bg-black/30 lg:hidden" onClick={() => setNavOpen(false)} />}

          {/* Main */}
          <main className="min-w-0 flex-1 px-4 pb-32 pt-6 md:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-neutral-900">{section.label}</h1>
                <p className="mt-1 text-sm text-neutral-500">{section.intro}</p>
              </div>
              {body}
            </div>
          </main>
        </div>

        {/* Save bar */}
        {section.docs.length > 0 && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur lg:left-64">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
              <p role="status" aria-live="polite" className="text-sm">
                {pending ? (
                  <span className="text-neutral-600">Saving…</span>
                ) : status.kind === "error" ? (
                  <span className="font-medium text-red-700">{status.message}</span>
                ) : sectionDirty.length ? (
                  <span className="font-medium text-amber-700">Unsaved changes</span>
                ) : status.kind === "saved" ? (
                  <span className="text-emerald-700">Saved at {status.at} — the site is updated.</span>
                ) : (
                  <span className="text-neutral-500">All changes saved</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {active !== "media" && (
                  <Btn variant="ghost" small onClick={restore} disabled={pending}>
                    Restore original
                  </Btn>
                )}
                {sectionDirty.length > 0 && (
                  <Btn onClick={discard} disabled={pending}>
                    Discard changes
                  </Btn>
                )}
                <Btn variant="primary" onClick={save} disabled={pending || sectionDirty.length === 0}>
                  {pending ? "Saving…" : "Save changes"}
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </MediaProvider>
  );
}

function Overview({ content: c, storage, go, enquiries }: { content: Content; storage: "local" | "blob"; go: (id: SectionId) => void; enquiries: number }) {
  const posts = publishedPosts(c.blog.posts);
  const stats: [string, number | string, SectionId][] = [
    ["Enquiries", enquiries, "enquiries"],
    ["Projects", c.projects.length, "projects"],
    ["On the home page", c.projects.filter((p) => p.featured).length, "projects"],
    ["Gallery photos", c.gallery.items.length, "gallery"],
    ["Clients", c.clients.list.length, "clients"],
    ["Published articles", posts.length, "blog"],
    ["Drafts", c.blog.posts.length - posts.length, "blog"],
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map(([label, n, id]) => (
          <button key={label} type="button" onClick={() => go(id)} className="rounded-xl border border-neutral-200 bg-white p-5 text-left shadow-sm hover:border-neutral-400">
            <p className="text-3xl font-semibold tabular-nums">{n}</p>
            <p className="mt-1 text-sm text-neutral-500">{label}</p>
          </button>
        ))}
      </div>
      <Card title="How saving works">
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-700">
          <li>Edit a section, then press <strong>Save changes</strong> at the bottom. The live site updates straight away. Sections with unsaved edits show an orange dot.</li>
          <li>
            <strong>Restore original</strong> brings a section back to the content the website launched with.
          </li>
          <li>
            Images: use <strong>Choose image</strong> to pick a site photo or upload your own. Uploads are resized and compressed automatically.
          </li>
          <li>
            Storage:{" "}
            {storage === "blob" ? (
              "content and images are stored in Vercel Blob."
            ) : (
              <>
                content is saved in the <code>content/</code> folder on the server and images in <code>content/uploads/</code>. Include that folder in your backups.
              </>
            )}
          </li>
        </ul>
      </Card>
    </div>
  );
}
