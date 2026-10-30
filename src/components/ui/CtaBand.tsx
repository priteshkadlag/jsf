import Button from "@/components/ui/Button";
import RevealText from "@/components/ui/RevealText";
import { site } from "@/data/site";

export default function CtaBand({ title = "Planning a villa, hotel or home?", accent = "Let’s talk timber." }: { title?: string; accent?: string }) {
  return (
    <section aria-label="Get in touch" className="container-x py-28 md:py-40">
      <div className="flex flex-col items-start gap-10 border-t border-line pt-16 md:flex-row md:items-end md:justify-between">
        <h2 className="max-w-4xl font-serif text-headline">
          <RevealText as="span" className="block">
            {title}
          </RevealText>
          <RevealText as="span" delay={0.1} className="block italic text-teak">
            {accent}
          </RevealText>
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button href="/contact">Request a quote</Button>
          <Button href={site.phoneHref} variant="outline" external>
            Call {site.phone}
          </Button>
        </div>
      </div>
    </section>
  );
}
