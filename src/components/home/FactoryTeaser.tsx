import SectionLabel from "@/components/ui/SectionLabel";
import RevealText from "@/components/ui/RevealText";
import InViewVideo from "@/components/ui/InViewVideo";
import Counter from "@/components/ui/Counter";
import Button from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";

export default function FactoryTeaser() {
  return (
    <section aria-labelledby="factory-title" className="grain relative overflow-hidden bg-bark py-28 text-ivory md:py-40">
      <div className="container-x relative grid gap-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <SectionLabel index="05" tone="light">
            The factory · Tuem, Goa
          </SectionLabel>
          <RevealText as="h2" id="factory-title" className="mt-8 font-serif text-headline">
            Where timber becomes craft
          </RevealText>
          <FadeIn>
            <p className="mt-8 max-w-md leading-relaxed text-ivory/70">
              Our Tuem facility is home to Goa&rsquo;s first automated moulder machine and Goa&rsquo;s first kiln seasoning
              plant — technology that pairs with the hands of skilled craftsmen to deliver precision at scale.
            </p>
          </FadeIn>

          <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-line-light pt-10">
            <div className="flex flex-col-reverse">
              <dt className="mt-2 text-sm text-ivory/60">frames produced every month</dt>
              <dd className="font-serif text-5xl text-brass md:text-6xl">
                <Counter value={2000} grouping />
              </dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="mt-2 text-sm text-ivory/60">moisture reduction from kiln seasoning</dt>
              <dd className="font-serif text-5xl text-brass md:text-6xl">
                <Counter value={15} suffix="%" />
              </dd>
            </div>
          </dl>

          <div className="mt-12">
            <Button href="/craftsmanship" variant="light">
              Explore our process
            </Button>
          </div>
        </div>

        <div className="relative md:col-span-6 md:col-start-7">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm md:aspect-[5/6]">
            <InViewVideo
              src="/videos/moulder.mp4"
              poster="factory/moulder"
              label="The automated moulder machine shaping a door frame at JSF's Tuem factory"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
