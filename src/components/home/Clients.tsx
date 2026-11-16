import Link from "next/link";
import Marquee from "@/components/ui/Marquee";
import Picture from "@/components/ui/Picture";
import SectionLabel from "@/components/ui/SectionLabel";
import { getContent } from "@/lib/cms/content";
import { tx } from "@/lib/cms/text-fields";
import type { Client } from "@/lib/cms/types";

function LogoCard({ name, logo }: Client) {
  return (
    <div className="mx-3 flex h-24 w-44 shrink-0 items-center justify-center rounded-sm bg-white p-3 shadow-[0_1px_0_rgb(31_42_36/0.06)] md:mx-4 md:h-28 md:w-52">
      {logo ? (
        <Picture media={logo} alt={name} sizes="200px" className="h-full w-full object-contain mix-blend-multiply" />
      ) : (
        <span className="text-center font-serif text-xl leading-tight text-ink">{name}</span>
      )}
    </div>
  );
}

export default async function Clients({ index = "07" }: { index?: string }) {
  const { clients, texts } = await getContent();
  const list = clients.list;
  if (list.length === 0) return null;
  const half = Math.ceil(list.length / 2);
  const t = (k: string) => tx(texts, `clientsStrip.${k}`);
  return (
    <section aria-labelledby="clients-title" className="overflow-hidden border-y border-line bg-sand/40 py-24 md:py-32">
      <div className="container-x mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <SectionLabel index={index}>{t("label")}</SectionLabel>
          <h2 id="clients-title" className="mt-6 font-serif text-title">
            {t("title")}
          </h2>
        </div>
        <div className="max-w-sm">
          <p className="text-sm text-stone">{t("text")}</p>
          <Link href="/clients" className="link-underline mt-4 inline-block text-sm font-semibold text-teak">
            {t("link")}
          </Link>
        </div>
      </div>
      <div className="space-y-6">
        <Marquee duration={55} label="Client logos">
          {list.slice(0, half).map((c) => (
            <LogoCard key={c.name} {...c} />
          ))}
        </Marquee>
        {list.length > 1 && (
          <Marquee duration={60} reverse>
            {list.slice(half).map((c) => (
              <LogoCard key={c.name} {...c} />
            ))}
          </Marquee>
        )}
      </div>
    </section>
  );
}
