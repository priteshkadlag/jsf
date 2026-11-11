import SectionLabel from "@/components/ui/SectionLabel";
import ScrubText from "@/components/ui/ScrubText";
import ParallaxImage from "@/components/ui/ParallaxImage";
import Button from "@/components/ui/Button";
import Counter from "@/components/ui/Counter";
import FadeIn from "@/components/ui/FadeIn";
import { stats } from "@/data/site";

export default function Intro() {
  return (
    <section aria-labelledby="intro-title" className="container-x py-28 md:py-44">
      <SectionLabel index="01">A legacy of fine woodwork</SectionLabel>
      <ScrubText
        as="h2"
        className="mt-10 max-w-[18ch] font-serif text-[clamp(2.4rem,5.2vw,5.6rem)] leading-[1.02] md:max-w-[22ch]"
      >
        Since 1989, we have made the doors, windows and joinery that give Goa&rsquo;s finest homes their character.
      </ScrubText>
      <span id="intro-title" className="sr-only">
        About JSF Industries
      </span>

      <div className="mt-20 grid gap-14 md:mt-28 md:grid-cols-12 md:gap-10">
        <ParallaxImage
          media="craft/teak-double-door"
          alt="A solid teak double door with brass handles at a villa entrance"
          shape="arch"
          className="aspect-[3/4] w-full md:col-span-4 md:col-start-2"
          sizes="(min-width: 768px) 30vw, 100vw"
        />
        <div className="flex flex-col justify-end gap-8 md:col-span-5 md:col-start-7">
          <FadeIn>
            <p className="text-lg leading-relaxed text-ink/85 md:text-xl">
              Founded by Shri Jivanbhai S. Fatania, JSF is a leader in doors and architectural joinery. We work from your drawings,
              solve the hard details and deliver woodwork that looks right and lasts.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="leading-relaxed text-stone">
              Everything is made in our own factory in Tuem, Goa. That means custom work at scale, strict quality checks and
              on-time delivery.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Button href="/about" variant="outline">
              Our story
            </Button>
          </FadeIn>
        </div>
      </div>

      <dl className="mt-24 grid grid-cols-2 gap-y-12 border-t border-line pt-12 md:mt-32 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse pr-6">
            <dt className="mt-3 text-sm text-stone">{s.label}</dt>
            <dd className="font-serif text-[clamp(2.8rem,5vw,4.8rem)] leading-none text-heading">
              <Counter value={s.value} suffix={s.suffix} grouping={s.grouping} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
