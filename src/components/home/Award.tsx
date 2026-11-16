import ParallaxImage from "@/components/ui/ParallaxImage";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import FadeIn from "@/components/ui/FadeIn";
import { getContent } from "@/lib/cms/content";
import { tx } from "@/lib/cms/text-fields";

export default async function Award({ index = "06" }: { index?: string }) {
  const { settings, texts } = await getContent();
  return (
    <section aria-labelledby="award-title" className="container-x py-28 md:py-40">
      <div className="grid items-center gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <SectionLabel index={index}>{tx(texts, "award.label")}</SectionLabel>
          <p className="mt-10 font-serif text-[clamp(5rem,12vw,11rem)] leading-[0.8] text-teak">{settings.award.year}</p>
          <RevealText as="h2" id="award-title" className="mt-6 font-serif text-title">
            {settings.award.title}
          </RevealText>
          <FadeIn>
            <p className="mt-6 max-w-md leading-relaxed text-stone">{tx(texts, "award.text")}</p>
          </FadeIn>
        </div>
        <ParallaxImage
          media={tx(texts, "award.image")}
          alt={tx(texts, "award.imageAlt")}
          className="aspect-[3/2] w-full md:col-span-7"
          sizes="(min-width: 768px) 58vw, 100vw"
        />
      </div>
    </section>
  );
}
