import Hero from "@/components/home/Hero";
import Intro from "@/components/home/Intro";
import Services from "@/components/home/Services";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import ArchReveal from "@/components/home/ArchReveal";
import FactoryTeaser from "@/components/home/FactoryTeaser";
import Award from "@/components/home/Award";
import Clients from "@/components/home/Clients";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <Services />
      <FeaturedProjects />
      <ArchReveal />
      <FactoryTeaser />
      <Award />
      <Clients />
    </>
  );
}
