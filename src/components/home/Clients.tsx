import Marquee from "@/components/ui/Marquee";
import Picture from "@/components/ui/Picture";
import SectionLabel from "@/components/ui/SectionLabel";
import Link from "next/link";
import { clients } from "@/data/clients";

function LogoCard({ name, logo }: (typeof clients)[number]) {
  return (
    <div className="mx-3 flex h-24 w-44 shrink-0 items-center justify-center rounded-sm bg-white p-3 shadow-[0_1px_0_rgb(31_42_36/0.06)] md:mx-4 md:h-28 md:w-52">
      <Picture
        media={logo}
        alt={name}
        sizes="200px"
        className="h-full w-full object-contain mix-blend-multiply"
      />
    </div>
  );
}

export default function Clients({ index = "07" }: { index?: string }) {
  const half = Math.ceil(clients.length / 2);
  return (
    <section aria-labelledby="clients-title" className="overflow-hidden border-y border-line bg-sand/40 py-24 md:py-32">
      <div className="container-x mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <SectionLabel index={index}>Our esteemed clients</SectionLabel>
          <h2 id="clients-title" className="mt-6 font-serif text-title">
            Trusted by Goa&rsquo;s leading developers
          </h2>
        </div>
        <div className="max-w-sm">
          <p className="text-sm text-stone">
            From luxury villa collections to Manohar International Airport — partners who return to us project after project.
          </p>
          <Link href="/clients" className="link-underline mt-4 inline-block text-sm font-semibold text-teak">
            View all clients →
          </Link>
        </div>
      </div>
      <div className="space-y-6">
        <Marquee duration={55} label="Client logos">
          {clients.slice(0, half).map((c) => (
            <LogoCard key={c.name} {...c} />
          ))}
        </Marquee>
        <Marquee duration={60} reverse>
          {clients.slice(half).map((c) => (
            <LogoCard key={c.name} {...c} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
