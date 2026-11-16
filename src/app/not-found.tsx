import Button from "@/components/ui/Button";
import BrandMark from "@/components/layout/BrandMark";
import SiteChrome from "@/components/layout/SiteChrome";
import { getContent } from "@/lib/cms/content";
import { tx } from "@/lib/cms/text-fields";

export default async function NotFound() {
  const { texts } = await getContent();
  return (
    <SiteChrome>
      <section className="container-x flex min-h-svh flex-col items-start justify-center gap-8 pb-20 pt-32">
        <BrandMark className="h-20 w-20 text-teak" />
        <p className="eyebrow text-teak">404</p>
        <h1 className="font-serif text-display">
          {tx(texts, "notFound.title")} <em className="text-teak">{tx(texts, "notFound.accent")}</em>
        </h1>
        <p className="max-w-md text-stone">{tx(texts, "notFound.text")}</p>
        <Button href="/">{tx(texts, "notFound.button")}</Button>
      </section>
    </SiteChrome>
  );
}
