import Link from "next/link";
import Logo from "@/components/layout/Logo";
import Button from "@/components/ui/Button";
import { nav, site } from "@/data/site";
import { products } from "@/data/products";

export default function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-espresso text-ivory">
      <div className="container-x relative pt-24 md:pt-32">
        <div className="grid gap-12 border-b border-line-light pb-16 md:grid-cols-12 md:pb-24">
          <div className="md:col-span-7">
            <p className="eyebrow mb-6 text-brass">Have a project in mind?</p>
            <h2 className="font-serif text-headline">
              Let&rsquo;s craft your
              <br />
              <em className="text-brass">next entrance.</em>
            </h2>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/contact" variant="light">
                Start a conversation
              </Button>
              <Button href={site.whatsappHref} variant="outline-light" external>
                WhatsApp us
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm md:col-span-5 md:pl-10">
            <div>
              <p className="eyebrow mb-5 text-ivory/50">Explore</p>
              <ul className="space-y-3">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="link-underline text-ivory/85 hover:text-ivory">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-5 text-ivory/50">Products</p>
              <ul className="space-y-3">
                {products.slice(0, 6).map((p) => (
                  <li key={p.slug}>
                    <Link href={`/products#${p.slug}`} className="link-underline text-ivory/85 hover:text-ivory">
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <address className="col-span-2 grid gap-1 not-italic text-ivory/85">
              <p className="eyebrow mb-4 text-ivory/50">Factory</p>
              <a href={site.mapsHref} target="_blank" rel="noopener noreferrer" className="hover:text-brass">
                {site.address.line1}, {site.address.line2}, {site.address.city} {site.address.postalCode}
              </a>
              <a href={site.phoneHref} className="mt-3 hover:text-brass">
                {site.phone}
              </a>
              <a href={`mailto:${site.email}`} className="hover:text-brass">
                {site.email}
              </a>
            </address>
          </div>
        </div>

        <div className="flex flex-col gap-6 py-10 text-xs text-ivory/50 md:flex-row md:items-center md:justify-between">
          <Logo tone="light" className="h-10 w-auto opacity-90" />
          <p>MSME (Udyam) registered · {site.udyam}</p>
          <p>
            © {site.name} · Est. {site.founded} · Crafted in Goa
          </p>
        </div>
      </div>
    </footer>
  );
}
