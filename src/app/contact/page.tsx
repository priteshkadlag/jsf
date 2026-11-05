import type { Metadata } from "next";
import RevealText from "@/components/ui/RevealText";
import FadeIn from "@/components/ui/FadeIn";
import ParallaxImage from "@/components/ui/ParallaxImage";
import ContactForm from "@/components/contact/ContactForm";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact — Request a Quote",
  description: `Talk to JSF Industries about doors, joinery and interiors for your project. Call ${site.phone}, email ${site.email} or visit our factory in Tuem, Goa.`,
  alternates: { canonical: "/contact" },
};

const details = [
  { label: "Call", value: site.phone, href: site.phoneHref },
  { label: "WhatsApp", value: "Message us on WhatsApp", href: site.whatsappHref, external: true },
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  {
    label: "Factory",
    value: `${site.address.line1}, ${site.address.line2}, ${site.address.city} ${site.address.postalCode}`,
    href: site.mapsHref,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="container-x pb-24 pt-36 md:pb-36 md:pt-48">
        <p className="eyebrow mb-8 text-teak">Contact</p>
        <h1 className="font-serif text-display">
          <RevealText as="span" trigger="load" className="block">
            Let&rsquo;s talk about
          </RevealText>
          <RevealText as="span" trigger="load" delay={0.12} className="block italic text-teak">
            your project
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
                Visits to the factory are welcome by appointment. MSME (Udyam) registered enterprise · {site.udyam}.
              </p>
            </FadeIn>
            <ParallaxImage
              media="craft/fanlight-door"
              alt="A white panelled door with an arched fanlight"
              shape="arch"
              className="mt-14 hidden aspect-[3/4] w-2/3 md:block"
              sizes="22vw"
            />
          </aside>
          <div className="md:col-span-7 md:col-start-6">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
