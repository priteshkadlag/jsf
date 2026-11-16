import PageHero from "@/components/ui/PageHero";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import FadeIn from "@/components/ui/FadeIn";
import InViewVideo from "@/components/ui/InViewVideo";
import ParallaxImage from "@/components/ui/ParallaxImage";
import CtaBand from "@/components/ui/CtaBand";
import { machinery, researchAndDevelopment } from "@/data/site";
import { getContent } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/cms/seo";
import { tx, txGroup, txList } from "@/lib/cms/text-fields";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const generateMetadata = () => pageMetadata("/craftsmanship");

export default async function CraftsmanshipPage() {
  const { texts } = await getContent();
  const hero = txGroup(texts, "craft.hero");
  const steps = txList(texts, "craft.process.steps");
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Craftsmanship", path: "/craftsmanship" }]} />
      <PageHero
        layout="split"
        eyebrow={hero.eyebrow}
        title={hero.title}
        accent={hero.accent}
        intro={hero.intro}
        media={hero.image}
        alt={hero.imageAlt}
      />

      <section aria-labelledby="process-title" className="container-x py-24 md:py-40">
        <div className="grid gap-14 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-32">
              <SectionLabel index="01">{tx(texts, "craft.process.label")}</SectionLabel>
              <RevealText as="h2" id="process-title" className="mt-8 font-serif text-headline">
                {tx(texts, "craft.process.title")}
              </RevealText>
              <ParallaxImage
                media="factory/frames"
                alt="Arched timber frames drying in the JSF workshop"
                shape="arch"
                className="mt-12 hidden aspect-[3/4] w-3/4 md:block"
                sizes="25vw"
              />
            </div>
          </div>
          <ol className="md:col-span-7 md:col-start-6">
            {steps.map((step, i) => (
              <FadeIn as="li" key={`${step.title}-${i}`} className="grid grid-cols-[4rem_1fr] gap-6 border-t border-line py-10 md:grid-cols-[6rem_1fr] md:py-14">
                <span className="font-serif text-5xl leading-none text-teak md:text-6xl">{i + 1}</span>
                <div>
                  <h3 className="font-serif text-3xl md:text-4xl">{step.title}</h3>
                  <p className="mt-4 max-w-lg leading-relaxed text-stone">{step.text}</p>
                </div>
              </FadeIn>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="machinery-title" className="grain relative bg-espresso py-24 text-ivory md:py-40">
        <div className="container-x relative">
          <SectionLabel index="02" tone="light">
            {tx(texts, "craft.machinery.label")}
          </SectionLabel>
          <RevealText as="h2" id="machinery-title" className="mt-8 max-w-4xl font-serif text-headline">
            {tx(texts, "craft.machinery.title")}
          </RevealText>

          <div className="mt-20 space-y-24 md:space-y-36">
            {machinery.map((m, i) => (
              <article key={m.key} className="grid items-center gap-10 md:grid-cols-12 md:gap-10">
                <div className={`relative aspect-[4/3] overflow-hidden rounded-sm md:col-span-7 ${i % 2 ? "md:order-2 md:col-start-6" : ""}`}>
                  <InViewVideo src={m.video} poster={m.poster} label={m.title} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className={`md:col-span-4 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-9"}`}>
                  <p className="eyebrow text-brass">0{i + 1}</p>
                  <h3 className="mt-4 font-serif text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.05]">{m.title}</h3>
                  <ul className="mt-8 space-y-4 border-t border-line-light pt-8">
                    {m.points.map((pt) => (
                      <li key={pt} className="flex gap-4 text-ivory/75">
                        <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-brass" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {researchAndDevelopment.length > 0 && (
        <section aria-labelledby="rnd-title" className="container-x pt-24 md:pt-36">
          <SectionLabel index="03">Research &amp; development</SectionLabel>
          <h2 id="rnd-title" className="sr-only">
            Research and development
          </h2>
          <ul className="mt-10 max-w-4xl space-y-6">
            {researchAndDevelopment.map((line) => (
              <FadeIn as="li" key={line} className="font-serif text-[clamp(1.6rem,2.8vw,2.6rem)] leading-[1.15]">
                {line}
              </FadeIn>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Workshop" className="container-x grid gap-4 py-24 md:grid-cols-3 md:py-36">
        <ParallaxImage media="craft/teak-stair-window" alt="A teak window above a timber staircase" className="aspect-[3/4]" sizes="(min-width:768px) 33vw, 100vw" />
        <ParallaxImage media="craft/staircase" alt="A bespoke wooden staircase crafted by JSF at La Caleta" className="aspect-[3/4] md:mt-24" sizes="(min-width:768px) 33vw, 100vw" />
        <ParallaxImage media="craft/stair-window" alt="A tall teak window lighting a villa stairwell" className="aspect-[3/4]" sizes="(min-width:768px) 33vw, 100vw" />
      </section>

      <CtaBand title={tx(texts, "craft.ctaTitle")} accent={tx(texts, "craft.ctaAccent")} />
    </>
  );
}
