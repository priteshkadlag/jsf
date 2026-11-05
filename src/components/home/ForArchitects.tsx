import SectionLabel from "@/components/ui/SectionLabel";
import FadeIn from "@/components/ui/FadeIn";
import Button from "@/components/ui/Button";
import { forArchitects } from "@/data/site";

/** Home section for JSF's main audience: architects and interior designers. */
export default function ForArchitects({ index }: { index: string }) {
  return (
    <section aria-labelledby="architects-title" className="container-x py-28 md:py-40">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <SectionLabel index={index}>For architects &amp; designers</SectionLabel>
          <h2 id="architects-title" className="mt-8 font-serif text-headline">
            You draw it. <em className="text-teak">We build it.</em>
          </h2>
        </div>
        <FadeIn className="self-end md:col-span-5 md:col-start-8">
          <p className="text-lg leading-relaxed text-stone">
            Architects and interior designers across Goa trust us with the details. We bring the technical know-how, so you
            don&rsquo;t need to spend your time on site.
          </p>
        </FadeIn>
      </div>

      <ul className="mt-16 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {forArchitects.map((item, i) => (
          <FadeIn as="li" key={item.title} delay={i * 0.06} className="flex min-h-56 flex-col justify-between gap-10 bg-ivory p-8">
            <span className="font-serif text-2xl text-teak">0{i + 1}</span>
            <div>
              <h3 className="font-serif text-2xl leading-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone">{item.text}</p>
            </div>
          </FadeIn>
        ))}
      </ul>

      <div className="mt-12">
        <Button href="/contact">Talk to our team</Button>
      </div>
    </section>
  );
}
