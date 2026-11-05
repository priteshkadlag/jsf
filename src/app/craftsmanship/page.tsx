import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import FadeIn from "@/components/ui/FadeIn";
import InViewVideo from "@/components/ui/InViewVideo";
import ParallaxImage from "@/components/ui/ParallaxImage";
import CtaBand from "@/components/ui/CtaBand";
import { machinery, researchAndDevelopment, site } from "@/data/site";

export const metadata: Metadata = {
  title: "Craftsmanship — Our Factory in Tuem, Goa",
  description:
    "Inside JSF Industries' Tuem factory: Goa's first automated moulder machine and kiln seasoning plant, producing around 2,000 door and window frames every month.",
  alternates: { canonical: "/craftsmanship" },
};

const process = [
  {
    title: "Timber selection",
    text: "Every project starts with the right material: solid teak for entrances and windows that must weather the coast, marine-grade ply and treated wood made to last, and the right core and finish for flush, veneer and laminated doors.",
  },
  {
    title: "Kiln seasoning",
    text: "Timber is seasoned in our kiln plant to bring moisture down by around 15%, so doors and frames resist bending and cracking through Goa's monsoons.",
  },
  {
    title: "Precision moulding",
    text: "Our automated moulder shapes frames and profiles to exact, repeatable dimensions — around 2,000 door and window frames a month.",
  },
  {
    title: "Joinery & hand finishing",
    text: "Arches, fanlights, raised panels and mouldings are assembled and finished by skilled carpenters, with quality checks before anything leaves the floor.",
  },
  {
    title: "Installation",
    text: "Our teams install on site and work through the details with architects and developers, so every door and window sits true and the architect doesn't need to be there.",
  },
];

export default function CraftsmanshipPage() {
  return (
    <>
      <PageHero
        layout="split"
        eyebrow="Craftsmanship · Tuem, Goa"
        title="Precision at scale,"
        accent="finished by hand"
        intro={`Our factory at ${site.address.line1}, Tuem, pairs Goa's first automated moulder and kiln seasoning plant with the experience of craftsmen who have shaped timber for decades.`}
        media="factory/craftsman"
        alt="A JSF craftsman shaping an arched window frame in the Tuem workshop"
      />

      <section aria-labelledby="process-title" className="container-x py-24 md:py-40">
        <div className="grid gap-14 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-32">
              <SectionLabel index="01">Process</SectionLabel>
              <RevealText as="h2" id="process-title" className="mt-8 font-serif text-headline">
                From log to landmark
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
            {process.map((step, i) => (
              <FadeIn as="li" key={step.title} className="grid grid-cols-[4rem_1fr] gap-6 border-t border-line py-10 md:grid-cols-[6rem_1fr] md:py-14">
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
            Machinery
          </SectionLabel>
          <RevealText as="h2" id="machinery-title" className="mt-8 max-w-4xl font-serif text-headline">
            Two firsts for Goa
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

      <CtaBand title="See the factory for yourself." accent="Visit us in Tuem." />
    </>
  );
}
