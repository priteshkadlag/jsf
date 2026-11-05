import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import CtaBand from "@/components/ui/CtaBand";
import FadeIn from "@/components/ui/FadeIn";
import ProductStack from "@/components/products/ProductStack";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Products — Doors, Custom Furniture & Bespoke Interiors",
  description:
    "Doors, custom furniture, bespoke interiors, wall panelling, staircases and ceilings, made by JSF Industries in Goa.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Doors, furniture"
        accent="& interiors"
        intro="Everything we make is built at our own factory in Tuem, Goa — from solid teak entrances to complete villa interiors, with strict quality control at every step."
        media="craft/carved-door"
        alt="A carved teak entrance door framed by a white villa portico"
      />

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

      <CtaBand title="Need something made to measure?" accent="We build it in Goa." />
    </>
  );
}
