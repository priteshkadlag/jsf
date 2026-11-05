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

export default function HomePage() {
  // Section numbers run on from "02 · What we do"; the testimonials section only takes a
  // number once it has quotes to show.
  let n = 2;
  const next = () => String(++n).padStart(2, "0");

  return (
    <>
      <Hero />
      <Intro />
      <Services />
      <ForArchitects index={next()} />
      <FeaturedProjects index={next()} />
      {testimonials.length > 0 && <Testimonials index={next()} />}
      <ArchReveal index={next()} />
      <FactoryTeaser index={next()} />
      <Award index={next()} />
      <Clients index={next()} />
    </>
  );
}
