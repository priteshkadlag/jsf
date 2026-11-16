import RevealText from "@/components/ui/RevealText";
import FadeIn from "@/components/ui/FadeIn";
import ProjectGrid from "@/components/projects/ProjectGrid";
import CtaBand from "@/components/ui/CtaBand";
import { getContent } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/cms/seo";
import { tx, txGroup } from "@/lib/cms/text-fields";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const generateMetadata = () => pageMetadata("/projects");

export default async function ProjectsPage() {
  const { projects, texts } = await getContent();
  const hero = txGroup(texts, "projects.hero");
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Projects", path: "/projects" }]} />
      <section className="container-x pb-28 pt-36 md:pb-40 md:pt-48">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="eyebrow mb-8 text-teak">{hero.eyebrow}</p>
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
          <ProjectGrid projects={projects.filter((p) => p.images.length > 0)} />
        </div>
      </section>
      <CtaBand title={tx(texts, "projects.ctaTitle")} accent={tx(texts, "projects.ctaAccent")} />
    </>
  );
}
