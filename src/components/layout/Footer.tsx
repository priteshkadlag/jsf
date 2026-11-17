import Link from "next/link";
import Logo from "@/components/layout/Logo";
import Button from "@/components/ui/Button";
import { products } from "@/data/products";
import { isExternal, phoneHref, resolveHref } from "@/lib/cms/links";
import type { Content } from "@/lib/cms/types";

type Props = Pick<Content, "settings" | "header" | "footer">;

export default function Footer({ settings, header, footer }: Props) {
  const primary = resolveHref(footer.primary.href, settings);
  const secondary = resolveHref(footer.secondary.href, settings);
  const explore = [...header.nav, ...footer.extraLinks.filter((l) => !header.nav.some((n) => n.href === l.href))];

  return (
    <footer className="grain relative overflow-hidden bg-espresso text-ivory">
      <div className="container-x relative pt-24 md:pt-32">
        <div className="grid gap-12 border-b border-line-light pb-16 md:grid-cols-12 md:pb-24">
          <div className="md:col-span-7">
            {footer.eyebrow && <p className="eyebrow mb-6 text-brass">{footer.eyebrow}</p>}
            <h2 className="font-serif text-headline">
              {footer.title}
              {footer.accent && (
                <>
                  <br />
                  <em className="text-brass">{footer.accent}</em>
                </>
              )}
            </h2>
            <div className="mt-10 flex flex-wrap gap-4">
              {footer.primary.label && (
                <Button href={primary} variant="light" external={isExternal(primary)}>
                  {footer.primary.label}
                </Button>
              )}
              {footer.secondary.label && (
                <Button href={secondary} variant="outline-light" external={isExternal(secondary)}>
                  {footer.secondary.label}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 text-sm md:col-span-5 md:pl-10">
            <div>
              <p className="eyebrow mb-5 text-ivory/50">{footer.exploreHeading}</p>
              <ul className="space-y-3">
                {explore.map((item) => (
                  <li key={item.href}>
                    <Link href={resolveHref(item.href, settings)} className="link-underline text-ivory/85 hover:text-ivory">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {footer.showProducts && (
              <div>
                <p className="eyebrow mb-5 text-ivory/50">{footer.productsHeading}</p>
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
            )}
            <address className="col-span-2 grid gap-1 not-italic text-ivory/85">
              <p className="eyebrow mb-4 text-ivory/50">{footer.addressHeading}</p>
              <a href={settings.mapsHref} target="_blank" rel="noopener noreferrer" className="hover:text-brass">
                {settings.address.line1}, {settings.address.line2}, {settings.address.city} {settings.address.postalCode}
              </a>
              <a href={phoneHref(settings)} className="mt-3 hover:text-brass">
                {settings.phone}
              </a>
              <a href={`mailto:${settings.email}`} className="hover:text-brass">
                {settings.email}
              </a>
            </address>
          </div>
        </div>

        {/* Extra bottom (phone) and right (desktop) space keeps the fixed back-to-top button off the text. */}
        <div className="flex flex-col gap-6 pb-28 pt-10 text-xs text-ivory/50 md:flex-row md:items-center md:justify-between md:py-10 md:pr-20">
          {/* The lock-up has hairline strokes, so it is shown large enough on phones for them to stay crisp. */}
          <Logo tone="light" variant="full" src={header.logoLight || undefined} alt={settings.name} className="h-auto w-full max-w-[220px] md:h-36 md:w-auto md:max-w-none" />
          {footer.legalLine && <p>{footer.legalLine}</p>}
          {footer.copyright && <p>{footer.copyright}</p>}
        </div>
      </div>
    </footer>
  );
}
