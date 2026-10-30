import type { Metadata } from "next";
import RevealText from "@/components/ui/RevealText";
import FadeIn from "@/components/ui/FadeIn";
import CtaBand from "@/components/ui/CtaBand";
import GalleryWall, { type GalleryItem } from "@/components/gallery/GalleryWall";
import { projects } from "@/data/projects";
import { mediaByPrefix, type MediaKey } from "@/lib/media";

export const metadata: Metadata = {
  title: "Gallery — Doors, Windows & Woodwork",
  description:
    "Browse JSF Industries' work: arched teak windows, wooden doors, staircases and carpentry across Goa's finest villas, plus our doors and factory in Tuem.",
  alternates: { canonical: "/gallery" },
};

const CATEGORIES = ["Isprava villas", "Vianaar villas", "Doors & windows", "Factory"];

const toTitle = (key: string) =>
  key
    .split("/")
    .pop()!
    .replace(/-\d+$/, "")
    .replace(/-/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

/** Interleave groups so the "All" view mixes projects instead of showing one villa after another. */
function interleave<T>(groups: T[][]): T[] {
  const out: T[] = [];
  const max = Math.max(...groups.map((g) => g.length));
  for (let i = 0; i < max; i++) groups.forEach((g) => g[i] && out.push(g[i]));
  return out;
}

function buildItems(): GalleryItem[] {
  const projectGroups = projects.map((p) =>
    p.images.map<GalleryItem>((media) => ({
      media,
      caption: p.name,
      category: `${p.developer} villas`,
      href: `/projects/${p.slug}`,
    })),
  );
  const crafted = [...mediaByPrefix("craft/"), ...mediaByPrefix("doors/")]
    .filter((k) => k !== "craft/hero")
    .map<GalleryItem>((media: MediaKey) => ({
      media,
      caption: media.startsWith("doors/") ? `${toTitle(media)} door` : toTitle(media),
      category: "Doors & windows",
    }));
  const factory = mediaByPrefix("factory/").map<GalleryItem>((media) => ({
    media,
    caption: `Tuem factory — ${toTitle(media).toLowerCase()}`,
    category: "Factory",
  }));
  return interleave([...projectGroups, crafted, factory]);
}

export default function GalleryPage() {
  const items = buildItems();
  return (
    <>
      <section className="container-x pb-24 pt-36 md:pb-36 md:pt-48">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="eyebrow mb-8 text-teak">Gallery · {items.length} photographs</p>
            <h1 className="font-serif text-display">
              <RevealText as="span" trigger="load" className="block">
                Every grain,
              </RevealText>
              <RevealText as="span" trigger="load" delay={0.12} className="block italic text-teak">
                every detail
              </RevealText>
            </h1>
          </div>
          <FadeIn delay={0.3} className="md:col-span-4">
            <p className="leading-relaxed text-stone">
              Arched teak windows, carved entrances, staircases and complete villa interiors — a visual archive of JSF&rsquo;s
              work across Goa, from the factory floor to the finished home.
            </p>
          </FadeIn>
        </div>

        <div className="mt-16 md:mt-24">
          <GalleryWall items={items} categories={CATEGORIES} />
        </div>
      </section>
      <CtaBand title="Seen something you love?" accent="We can make it for you." />
    </>
  );
}
