import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import { TrackingBottom, TrackingTop } from "@/components/layout/Tracking";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/layout/Preloader";
import Cursor from "@/components/layout/Cursor";
import BackToTop from "@/components/layout/BackToTop";
import { getContent } from "@/lib/cms/content";
import { phoneHref } from "@/lib/cms/links";
import { businessGraph, jsonLd } from "@/lib/cms/schema";

/** Everything around a public page: smooth scroll, preloader, header, footer and the business JSON-LD. */
export default async function SiteChrome({ children }: { children: ReactNode }) {
  const { settings, header, footer, integrations, seo } = await getContent();

  const organizationJsonLd = businessGraph(settings, seo.ogImage);

  return (
    <>
      <TrackingTop i={integrations} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd) }}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-ivory"
      >
        Skip to content
      </a>
      <SmoothScroll>
        <Preloader />
        {/* The header highlights the current page (usePathname), so it gets its own boundary. Prerendered
            pages include it in their HTML; pages rendered on demand show the logo bar until it streams in. */}
        <Suspense
          fallback={
            <div className="fixed inset-x-0 top-0 z-50">
              <div className="container-x flex h-[72px] items-center md:h-20">
                <Link href="/" aria-label={`${settings.name} — home`}>
                  <Logo src={header.logoDark || undefined} alt={settings.name} className="h-10 w-auto md:h-12" />
                </Link>
              </div>
            </div>
          }
        >
          <Header
            nav={header.nav}
            cta={header.showCta && header.cta.label ? header.cta : null}
            phone={settings.phone}
            phoneHref={phoneHref(settings)}
            email={settings.email}
            siteName={settings.name}
            logoDark={header.logoDark || undefined}
            logoLight={header.logoLight || undefined}
          />
        </Suspense>
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer settings={settings} header={header} footer={footer} />
        <BackToTop />
        <Cursor />
      </SmoothScroll>
      <TrackingBottom i={integrations} />
    </>
  );
}
