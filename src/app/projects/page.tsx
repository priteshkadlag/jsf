import type { Metadata } from "next";
import RevealText from "@/components/ui/RevealText";
import FadeIn from "@/components/ui/FadeIn";
import ProjectGrid from "@/components/projects/ProjectGrid";
import CtaBand from "@/components/ui/CtaBand";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects — Luxury Villas Across Goa",
  description:
    "Wooden doors, arched windows, staircases and carpentry by JSF Industries for luxury villas in Goa — including Isprava's Moira Chapters, Amora and Villa Rosa, and Vianaar's La Selva and La Mandarina.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <section className="container-x pb-28 pt-36 md:pb-40 md:pt-48">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="eyebrow mb-8 text-teak">Projects</p>
            <h1 className="font-serif text-display">
              <RevealText as="span" trigger="load" className="block">
                Homes we&rsquo;ve
              </RevealText>
              <RevealText as="span" trigger="load" delay={0.12} className="block italic text-teak">
                given character
              </RevealText>
            </h1>
          </div>
          <FadeIn delay={0.3} className="md:col-span-4">
            <p className="leading-relaxed text-stone">
              A selection of villas across Goa where JSF crafted the doors, windows, staircases and carpentry — in partnership
              with two of India&rsquo;s most respected luxury developers.
            </p>
          </FadeIn>
        </div>

        <div className="mt-16 md:mt-24">
          <ProjectGrid projects={projects} />
        </div>
      </section>
      <CtaBand title="Building something remarkable?" accent="Let’s add our chapter." />
    </>
  );
}
