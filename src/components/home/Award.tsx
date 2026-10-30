import ParallaxImage from "@/components/ui/ParallaxImage";
import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import FadeIn from "@/components/ui/FadeIn";
import { site } from "@/data/site";

export default function Award({ index = "06" }: { index?: string }) {
  return (
    <section aria-labelledby="award-title" className="container-x py-28 md:py-40">
      <div className="grid items-center gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <SectionLabel index={index}>Recognition</SectionLabel>
          <p className="mt-10 font-serif text-[clamp(5rem,12vw,11rem)] leading-[0.8] text-teak">{site.award.year}</p>
          <RevealText as="h2" id="award-title" className="mt-6 font-serif text-title">
            Door Manufacturing Company of the Year
          </RevealText>
          <FadeIn>
            <p className="mt-6 max-w-md leading-relaxed text-stone">
              Awarded by Business Goa — recognition of more than three decades spent perfecting the craft of the Goan door,
              and of the team that makes it happen every day.
            </p>
          </FadeIn>
        </div>
        <ParallaxImage
          media="award/ceremony"
          alt="The JSF Industries team receiving the Business Goa award for Door Manufacturing Company of the Year 2025"
          className="aspect-[3/2] w-full md:col-span-7"
          sizes="(min-width: 768px) 58vw, 100vw"
        />
      </div>
    </section>
  );
}
