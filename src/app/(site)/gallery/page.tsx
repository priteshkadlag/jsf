import RevealText from "@/components/ui/RevealText";
import FadeIn from "@/components/ui/FadeIn";
import CtaBand from "@/components/ui/CtaBand";
import GalleryWall from "@/components/gallery/GalleryWall";
import { getContent } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/cms/seo";
import { tx, txGroup } from "@/lib/cms/text-fields";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const generateMetadata = () => pageMetadata("/gallery");

export default async function GalleryPage() {
  const { gallery, texts } = await getContent();
  const hero = txGroup(texts, "gallery.hero");
  const items = gallery.items;
  // Only offer filters that have photos in them.
  const categories = gallery.categories.filter((c) => items.some((i) => i.category === c));

  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Gallery", path: "/gallery" }]} />
      <section className="container-x pb-24 pt-36 md:pb-36 md:pt-48">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="eyebrow mb-8 text-teak">
              {hero.eyebrow} · {items.length} photographs
            </p>
            <h1 className="font-serif text-display">
              <RevealText as="span" trigger="load" className="block">
                {hero.title}
              </RevealText>
              <RevealText as="span" trigger="load" delay={0.12} className="block italic text-teak">
                {hero.accent}
              </RevealText>
            </h1>
          </div>
          <FadeIn delay={0.3} className="md:col-span-4">
            <p className="leading-relaxed text-stone">{hero.intro}</p>
          </FadeIn>
        </div>

        <div className="mt-16 md:mt-24">
          <GalleryWall items={items} categories={categories} />
        </div>
      </section>
      <CtaBand title={tx(texts, "gallery.ctaTitle")} accent={tx(texts, "gallery.ctaAccent")} />
    </>
  );
}
