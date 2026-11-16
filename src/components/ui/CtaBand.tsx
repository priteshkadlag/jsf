import Button from "@/components/ui/Button";
import RevealText from "@/components/ui/RevealText";
import { getContent } from "@/lib/cms/content";
import { phoneHref } from "@/lib/cms/links";
import { tx } from "@/lib/cms/text-fields";

/** Closing call to action. Page-specific lines come from props; anything left empty uses Admin → Page text → Shared. */
export default async function CtaBand({ title, accent }: { title?: string; accent?: string }) {
  const { settings, texts } = await getContent();
  const heading = title || tx(texts, "cta.title");
  const italic = accent || tx(texts, "cta.accent");
  return (
    <section aria-label="Get in touch" className="container-x py-28 md:py-40">
      <div className="flex flex-col items-start gap-10 border-t border-line pt-16 md:flex-row md:items-end md:justify-between">
        <h2 className="max-w-4xl font-serif text-headline">
          <RevealText as="span" className="block">
            {heading}
          </RevealText>
          {italic && (
            <RevealText as="span" delay={0.1} className="block italic text-teak">
              {italic}
            </RevealText>
          )}
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button href="/contact">{tx(texts, "cta.button")}</Button>
          <Button href={phoneHref(settings)} variant="outline" external>
            Call {settings.phone}
          </Button>
        </div>
      </div>
    </section>
  );
}
