"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Logo from "@/components/layout/Logo";
import { useLenis } from "@/components/providers/SmoothScroll";
import { nav, site } from "@/data/site";

const ease = [0.76, 0, 0.24, 1] as const;

export default function Header() {
  const pathname = usePathname();
  const lenis = useLenis();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the menu whenever the route changes (state adjusted during render, not in an effect).
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    const hide = !open && y > 160 && y > prev;
    setHidden(hide);
    // Lets sticky elements elsewhere (e.g. gallery filters) slide up when the header hides.
    document.documentElement.dataset.header = hide ? "hidden" : "shown";
  });

  const wasOpen = useRef(false);
  useEffect(() => {
    // Only restart scrolling after the menu closes, so we never override the preloader's lock.
    if (open) {
      lenis?.stop();
      wasOpen.current = true;
    } else if (wasOpen.current) {
      lenis?.start();
      wasOpen.current = false;
    }
    document.documentElement.style.overflow = open && !lenis ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.7, ease }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled && !open ? "border-b border-line bg-ivory/80 backdrop-blur-md" : "border-b border-transparent"
        }`}
      >
        <div className="container-x flex h-[72px] items-center justify-between md:h-20">
          <Link href="/" aria-label="JSF Industries — home" className="relative z-10">
            <Logo tone={open ? "light" : "dark"} className="h-8 w-auto transition md:h-9" />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-6 text-[0.82rem] xl:gap-9 font-medium tracking-wide">
              {nav.slice(0, -1).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`link-underline py-1 transition-colors ${isActive(item.href) ? "text-teak" : "text-ink hover:text-teak"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden rounded-full bg-ink px-5 py-2.5 text-[0.8rem] font-semibold tracking-wide text-ivory transition-colors duration-500 hover:bg-teak sm:inline-flex"
            >
              Enquire now
            </Link>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={`flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border transition-colors lg:hidden ${
                open ? "border-ivory/30 text-ivory" : "border-ink/20 text-ink"
              }`}
            >
              <span className={`h-px w-5 bg-current transition-transform duration-500 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`h-px w-5 bg-current transition-transform duration-500 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="grain fixed inset-0 z-40 flex flex-col bg-espresso text-ivory lg:hidden"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.9, ease }}
          >
            <nav aria-label="Mobile" className="container-x flex flex-1 flex-col justify-center pt-20">
              <ul className="space-y-1">
                {nav.map((item, i) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "110%" }}
                      animate={{ y: "0%" }}
                      exit={{ y: "110%" }}
                      transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        autoFocus={i === 0}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={`flex items-baseline gap-4 font-serif text-[clamp(2.6rem,11vw,4.5rem)] leading-[1.05] ${
                          isActive(item.href) ? "text-brass" : "text-ivory"
                        }`}
                      >
                        <span className="eyebrow text-ivory/40">0{i + 1}</span>
                        {item.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
              className="container-x grid gap-2 border-t border-line-light py-8 text-sm text-ivory/70"
            >
              <a href={site.phoneHref}>{site.phone}</a>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
