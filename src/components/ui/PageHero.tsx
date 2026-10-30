import RevealText from "@/components/ui/RevealText";
import ParallaxImage from "@/components/ui/ParallaxImage";
import FadeIn from "@/components/ui/FadeIn";
import type { MediaKey } from "@/lib/media";

type Props = {
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  media: MediaKey;
  alt: string;
  /** "wide" puts a full-bleed landscape image under the title; "split" sets a portrait arch beside it. */
  layout?: "wide" | "split";
};

export default function PageHero({ eyebrow, title, accent, intro, media, alt, layout = "wide" }: Props) {
  if (layout === "split") {
    return (
      <section className="container-x grid min-h-svh items-end gap-12 pb-16 pt-32 md:grid-cols-12 md:gap-10 md:pb-24 md:pt-40">
        <div className="md:col-span-7">
          <p className="eyebrow mb-8 text-teak">{eyebrow}</p>
          <RevealText as="h1" trigger="load" className="font-serif text-display">
            {title}
          </RevealText>
          <RevealText as="p" trigger="load" delay={0.15} className="font-serif text-display italic text-teak">
            {accent}
          </RevealText>
          <FadeIn delay={0.4}>
            <p className="mt-10 max-w-xl text-lg leading-relaxed text-stone">{intro}</p>
          </FadeIn>
        </div>
        <ParallaxImage
          media={media}
          alt={alt}
          priority
          shape="arch"
          className="aspect-[3/4] w-full md:col-span-4 md:col-start-9"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
      </section>
    );
  }

  return (
    <section>
      <div className="container-x pb-14 pt-36 md:pb-20 md:pt-48">
        <p className="eyebrow mb-8 text-teak">{eyebrow}</p>
        <h1 className="font-serif text-display">
          <RevealText as="span" trigger="load" className="block">
            {title}
          </RevealText>
          <RevealText as="span" trigger="load" delay={0.15} className="block italic text-teak">
            {accent}
          </RevealText>
        </h1>
        <FadeIn delay={0.4}>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-stone md:ml-[40%]">{intro}</p>
        </FadeIn>
      </div>
      <ParallaxImage media={media} alt={alt} priority className="aspect-[4/5] w-full md:aspect-[21/9]" sizes="100vw" strength={16} />
    </section>
  );
}
