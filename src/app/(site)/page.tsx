import Hero from "@/components/home/Hero";
import Intro from "@/components/home/Intro";
import Services from "@/components/home/Services";
import ForArchitects from "@/components/home/ForArchitects";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import Testimonials from "@/components/home/Testimonials";
import ArchReveal from "@/components/home/ArchReveal";
import FactoryTeaser from "@/components/home/FactoryTeaser";
import Award from "@/components/home/Award";
import Clients from "@/components/home/Clients";
import { testimonials } from "@/data/site";
import { getContent } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/cms/seo";
import { txGroup } from "@/lib/cms/text-fields";

export const generateMetadata = () => pageMetadata("/");

export default async function HomePage() {
  const { texts, projects, settings } = await getContent();
  const featured = projects.filter((p) => p.featured && p.images.length > 0);

  // Section numbers run on from "02 · What we do"; optional sections only take a number when shown.
  let n = 2;
  const next = () => String(++n).padStart(2, "0");

  return (
    <>
      <Hero text={txGroup(texts, "home.hero")} siteName={settings.name} />
      <Intro />
      <Services text={txGroup(texts, "home.services")} />
      <ForArchitects index={next()} />
      {featured.length > 0 && (
        <FeaturedProjects index={next()} projects={featured} total={projects.length} text={txGroup(texts, "home.featured")} />
      )}
      {testimonials.length > 0 && <Testimonials index={next()} />}
      <ArchReveal index={next()} text={txGroup(texts, "home.arch")} />
      <FactoryTeaser index={next()} />
      <Award index={next()} />
      <Clients index={next()} />
    </>
  );
}
