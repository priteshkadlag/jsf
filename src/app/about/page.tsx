import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import ScrubText from "@/components/ui/ScrubText";
import ParallaxImage from "@/components/ui/ParallaxImage";
import FadeIn from "@/components/ui/FadeIn";
import VideoModal from "@/components/ui/VideoModal";
import Clients from "@/components/home/Clients";
import Award from "@/components/home/Award";
import CtaBand from "@/components/ui/CtaBand";
import Milestones from "@/components/about/Milestones";
import { site, whyChooseUs } from "@/data/site";

export const metadata: Metadata = {
  title: "About — A Legacy of Fine Woodwork",
  description:
    "Founded in 1989 by Shri Jivanbhai S. Fatania, JSF Industries is a Goa-based leader in doors, architectural joinery and bespoke interiors.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About JSF · Est. 1989"
        title="A legacy of"
        accent="fine woodwork"
        intro="From custom doors to complete interiors, JSF brings precision woodwork to homes, villas and commercial spaces across Goa, working hand in hand with architects and designers."
        media="craft/facade"
        alt="A whitewashed Goan villa with wooden doors and windows by JSF Industries"
      />

      <section aria-labelledby="story-title" className="container-x py-28 md:py-44">
        <div className="grid gap-14 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <SectionLabel index="01">Our story</SectionLabel>
            <h2 id="story-title" className="sr-only">
              Our story
            </h2>
          </div>
          <div className="md:col-span-8">
            <ScrubText className="font-serif text-[clamp(2rem,3.8vw,3.9rem)] leading-[1.08]">
              Founded in 1989 by Shri Jivanbhai S. Fatania, JSF is a leader in doors and architectural joinery. Our work balances good looks with performance, and is built to last.
            </ScrubText>
          </div>
        </div>

        <div className="mt-20 grid gap-14 md:mt-32 md:grid-cols-12 md:gap-10">
          <ParallaxImage
            media="factory/craftsman"
            alt="A JSF craftsman assembling an arched timber frame in the workshop"
            shape="arch"
            className="aspect-[3/4] w-full md:col-span-4"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
          <div className="flex flex-col justify-center gap-8 md:col-span-6 md:col-start-6">
            <FadeIn>
              <p className="text-lg leading-relaxed text-ink/85 md:text-xl">
                We specialise in doors, custom joinery and interiors, made from marine-grade ply and treated wood.
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="leading-relaxed text-stone">
                Our factory in Tuem, Goa, lets us make custom work efficiently and check every project closely. With decades of
                experience across homes and commercial projects, JSF delivers bespoke interiors, on time and to the detail.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="eyebrow text-teak">MSME (Udyam) registered · {site.udyam}</p>
            </FadeIn>
          </div>
        </div>
      </section>

      <Milestones />

      <section aria-labelledby="why-title" className="container-x py-28 md:py-40">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionLabel index="03">Why choose us</SectionLabel>
            <RevealText as="h2" id="why-title" className="mt-8 font-serif text-headline">
              The JSF promise
            </RevealText>
          </div>
        </div>
        <ul className="mt-16 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item, i) => (
            <FadeIn as="li" key={item.title} delay={i * 0.06} className="flex min-h-64 flex-col justify-between gap-10 bg-ivory p-8">
              <span className="font-serif text-2xl text-teak">0{i + 1}</span>
              <div>
                <h3 className="font-serif text-2xl leading-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone">{item.text}</p>
              </div>
            </FadeIn>
          ))}
        </ul>
      </section>

      <section aria-label="The JSF film" className="container-x pb-12">
        <VideoModal src="/videos/jsf-film.mp4" poster="factory/frames" title="Watch the JSF film" className="aspect-[4/5] md:aspect-[21/9]" />
      </section>

      <Award index="04" />
      <Clients index="05" />
      <CtaBand />
    </>
  );
}
