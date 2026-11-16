import PageHero from "@/components/ui/PageHero";
import CtaBand from "@/components/ui/CtaBand";
import FadeIn from "@/components/ui/FadeIn";
import ProductStack from "@/components/products/ProductStack";
import { products } from "@/data/products";
import { getContent } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/cms/seo";
import { tx, txGroup } from "@/lib/cms/text-fields";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const generateMetadata = () => pageMetadata("/products");

export default async function ProductsPage() {
  const { texts } = await getContent();
  const hero = txGroup(texts, "products.hero");
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Products", path: "/products" }]} />
      <PageHero eyebrow={hero.eyebrow} title={hero.title} accent={hero.accent} intro={hero.intro} media={hero.image} alt={hero.imageAlt} />

      <nav aria-label="Product categories" className="container-x py-16 md:py-24">
        <p className="eyebrow mb-6 text-stone">The collection — {products.length} categories</p>
        <ul className="flex flex-wrap gap-2 md:gap-3">
          {products.map((p, i) => (
            <FadeIn as="li" key={p.slug} delay={i * 0.04} y={20}>
              <a
                href={`#${p.slug}`}
                className="group inline-flex items-center gap-3 rounded-full border border-line px-5 py-3 text-sm transition-colors duration-500 hover:border-ink hover:bg-ink hover:text-ivory md:text-base"
              >
                <span className="eyebrow text-teak transition-colors group-hover:text-brass">{String(i + 1).padStart(2, "0")}</span>
                {p.name}
              </a>
            </FadeIn>
          ))}
        </ul>
      </nav>

      <ProductStack />

      <CtaBand title={tx(texts, "products.ctaTitle")} accent={tx(texts, "products.ctaAccent")} />
    </>
  );
}
