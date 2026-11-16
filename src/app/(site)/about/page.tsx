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
import { getContent } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/cms/seo";
import { tx, txGroup, txList } from "@/lib/cms/text-fields";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const generateMetadata = () => pageMetadata("/about");

export default async function AboutPage() {
  const { settings, texts } = await getContent();
  const hero = txGroup(texts, "about.hero");
  const story = txGroup(texts, "about.story");
  const why = txList(texts, "about.why.items");

  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "About", path: "/about" }]} />
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        accent={hero.accent}
        intro={hero.intro}
        media={hero.image}
        alt={hero.imageAlt}
      />

      <section aria-labelledby="story-title" className="container-x py-28 md:py-44">
        <div className="grid gap-14 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <SectionLabel index="01">{story.label}</SectionLabel>
            <h2 id="story-title" className="sr-only">
              {story.label}
            </h2>
          </div>
          <div className="md:col-span-8">
            <ScrubText className="font-serif text-[clamp(2rem,3.8vw,3.9rem)] leading-[1.08]">{story.statement}</ScrubText>
          </div>
        </div>

        <div className="mt-20 grid gap-14 md:mt-32 md:grid-cols-12 md:gap-10">
          <ParallaxImage
            media={story.image}
            alt={story.imageAlt}
            shape="arch"
            className="aspect-[3/4] w-full md:col-span-4"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
          <div className="flex flex-col justify-center gap-8 md:col-span-6 md:col-start-6">
            <FadeIn>
              <p className="text-lg leading-relaxed text-ink/85 md:text-xl">{story.lead}</p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="leading-relaxed text-stone">{story.body}</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="eyebrow text-teak">MSME (Udyam) registered · {settings.udyam}</p>
            </FadeIn>
          </div>
        </div>
      </section>

      <Milestones />

      <section aria-labelledby="why-title" className="container-x py-28 md:py-40">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionLabel index="03">{tx(texts, "about.why.label")}</SectionLabel>
            <RevealText as="h2" id="why-title" className="mt-8 font-serif text-headline">
              {tx(texts, "about.why.title")}
            </RevealText>
          </div>
        </div>
        <ul className="mt-16 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {why.map((item, i) => (
            <FadeIn as="li" key={`${item.title}-${i}`} delay={i * 0.06} className="flex min-h-64 flex-col justify-between gap-10 bg-ivory p-8">
              <span className="font-serif text-2xl text-teak">{String(i + 1).padStart(2, "0")}</span>
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
