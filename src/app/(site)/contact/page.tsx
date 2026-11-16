import RevealText from "@/components/ui/RevealText";
import FadeIn from "@/components/ui/FadeIn";
import ParallaxImage from "@/components/ui/ParallaxImage";
import ContactForm from "@/components/contact/ContactForm";
import { getContent } from "@/lib/cms/content";
import { phoneHref, whatsappHref } from "@/lib/cms/links";
import { pageMetadata } from "@/lib/cms/seo";
import { tx } from "@/lib/cms/text-fields";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const generateMetadata = () => pageMetadata("/contact");

export default async function ContactPage() {
  const { settings, texts } = await getContent();
  const details = [
    { label: "Call", value: settings.phone, href: phoneHref(settings) },
    { label: "WhatsApp", value: "Message us on WhatsApp", href: whatsappHref(settings), external: true },
    { label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    {
      label: "Factory",
      value: `${settings.address.line1}, ${settings.address.line2}, ${settings.address.city} ${settings.address.postalCode}`,
      href: settings.mapsHref,
      external: true,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Contact", path: "/contact" }]} />
      <section className="container-x pb-24 pt-36 md:pb-36 md:pt-48">
        <p className="eyebrow mb-8 text-teak">{tx(texts, "contact.hero.eyebrow")}</p>
        <h1 className="font-serif text-display">
          <RevealText as="span" trigger="load" className="block">
            {tx(texts, "contact.hero.title")}
          </RevealText>
          <RevealText as="span" trigger="load" delay={0.12} className="block italic text-teak">
            {tx(texts, "contact.hero.accent")}
          </RevealText>
        </h1>

        <div className="mt-20 grid gap-16 md:mt-28 md:grid-cols-12 md:gap-10">
          <aside className="md:col-span-4">
            <FadeIn>
              <ul className="divide-y divide-line border-y border-line">
                {details.map((d) => (
                  <li key={d.label}>
                    <a
                      href={d.href}
                      {...(d.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group block py-6"
                    >
                      <span className="eyebrow text-stone">{d.label}</span>
                      <span className="mt-2 block font-serif text-2xl leading-snug transition-colors duration-500 group-hover:text-teak">
                        {d.value}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm leading-relaxed text-stone">
                {tx(texts, "contact.note")} MSME (Udyam) registered enterprise · {settings.udyam}.
              </p>
            </FadeIn>
            <ParallaxImage
              media={tx(texts, "contact.image")}
              alt={tx(texts, "contact.imageAlt")}
              shape="arch"
              className="mt-14 hidden aspect-[3/4] w-2/3 md:block"
              sizes="22vw"
            />
          </aside>
          <div className="md:col-span-7 md:col-start-6">
            <ContactForm phone={settings.phone} email={settings.email} />
          </div>
        </div>
      </section>
    </>
  );
}
