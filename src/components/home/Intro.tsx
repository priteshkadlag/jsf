import SectionLabel from "@/components/ui/SectionLabel";
import ScrubText from "@/components/ui/ScrubText";
import ParallaxImage from "@/components/ui/ParallaxImage";
import Button from "@/components/ui/Button";
import Counter from "@/components/ui/Counter";
import FadeIn from "@/components/ui/FadeIn";
import { stats } from "@/data/site";
import { getContent } from "@/lib/cms/content";
import { tx } from "@/lib/cms/text-fields";

export default async function Intro() {
  const { texts } = await getContent();
  const t = (k: string) => tx(texts, `home.intro.${k}`);
  return (
    <section aria-labelledby="intro-title" className="container-x py-28 md:py-44">
      <SectionLabel index="01">{t("label")}</SectionLabel>
      <ScrubText
        as="h2"
        className="mt-10 max-w-[18ch] font-serif text-[clamp(2.4rem,5.2vw,5.6rem)] leading-[1.02] md:max-w-[22ch]"
      >
        {t("title")}
      </ScrubText>
      <span id="intro-title" className="sr-only">
        About us
      </span>

      <div className="mt-20 grid gap-14 md:mt-28 md:grid-cols-12 md:gap-10">
        <ParallaxImage
          media={t("image")}
          alt={t("imageAlt")}
          shape="arch"
          className="aspect-[3/4] w-full md:col-span-4 md:col-start-2"
          sizes="(min-width: 768px) 30vw, 100vw"
        />
        <div className="flex flex-col justify-end gap-8 md:col-span-5 md:col-start-7">
          <FadeIn>
            <p className="text-lg leading-relaxed text-ink/85 md:text-xl">{t("lead")}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="leading-relaxed text-stone">{t("body")}</p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Button href="/about" variant="outline">
              {t("button")}
            </Button>
          </FadeIn>
        </div>
      </div>

      <dl className="mt-24 grid grid-cols-2 gap-y-12 border-t border-line pt-12 md:mt-32 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse pr-6">
            <dt className="mt-3 text-sm text-stone">{s.label}</dt>
            <dd className="font-serif text-[clamp(2.8rem,5vw,4.8rem)] leading-none text-heading">
              <Counter value={s.value} suffix={s.suffix} grouping={s.grouping} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
