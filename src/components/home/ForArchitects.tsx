import SectionLabel from "@/components/ui/SectionLabel";
import FadeIn from "@/components/ui/FadeIn";
import Button from "@/components/ui/Button";
import { getContent } from "@/lib/cms/content";
import { tx, txList } from "@/lib/cms/text-fields";

/** Home section for JSF's main audience: architects and interior designers. */
export default async function ForArchitects({ index }: { index: string }) {
  const { texts } = await getContent();
  const t = (k: string) => tx(texts, `home.architects.${k}`);
  const items = txList(texts, "home.architects.items");
  return (
    <section aria-labelledby="architects-title" className="container-x py-28 md:py-40">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <SectionLabel index={index}>{t("label")}</SectionLabel>
          <h2 id="architects-title" className="mt-8 font-serif text-headline">
            {t("title")} {t("accent") && <em className="text-teak">{t("accent")}</em>}
          </h2>
        </div>
        <FadeIn className="self-end md:col-span-5 md:col-start-8">
          <p className="text-lg leading-relaxed text-stone">{t("text")}</p>
        </FadeIn>
      </div>

      {items.length > 0 && (
        <ul className="mt-16 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <FadeIn as="li" key={`${item.title}-${i}`} delay={i * 0.06} className="flex min-h-56 flex-col justify-between gap-10 bg-ivory p-8">
              <span className="font-serif text-2xl text-teak">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-serif text-2xl leading-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone">{item.text}</p>
              </div>
            </FadeIn>
          ))}
        </ul>
      )}

      <div className="mt-12">
        <Button href="/contact">{t("button")}</Button>
      </div>
    </section>
  );
}
