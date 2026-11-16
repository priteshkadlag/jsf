"use client";

import type { FooterContent, HeaderContent, Link } from "@/lib/cms/types";
import { ImageField } from "../media";
import { Card, LINK_HELP, LinkListEditor, TextInput, Toggle } from "../ui";

type Props = {
  header: HeaderContent;
  footer: FooterContent;
  onHeader: (v: HeaderContent) => void;
  onFooter: (v: FooterContent) => void;
};

function LinkFields({ label, value, onChange }: { label: string; value: Link; onChange: (v: Link) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TextInput label={`${label} — text`} value={value.label} onChange={(v) => onChange({ ...value, label: v })} />
      <TextInput label={`${label} — link`} value={value.href} onChange={(v) => onChange({ ...value, href: v })} help={LINK_HELP} />
    </div>
  );
}

export default function HeaderFooterEditor({ header: h, footer: f, onHeader, onFooter }: Props) {
  const setH = (p: Partial<HeaderContent>) => onHeader({ ...h, ...p });
  const setF = (p: Partial<FooterContent>) => onFooter({ ...f, ...p });

  return (
    <div className="space-y-6">
      <Card title="Header menu" description="The links in the top bar and the mobile menu. Keep it to around 8 so it fits on laptops.">
        <LinkListEditor label="Menu links" value={h.nav} onChange={(nav) => setH({ nav })} help={LINK_HELP} />
      </Card>

      <Card title="Header button">
        <Toggle label="Show the button in the header" checked={h.showCta} onChange={(showCta) => setH({ showCta })} />
        {h.showCta && <LinkFields label="Button" value={h.cta} onChange={(cta) => setH({ cta })} />}
        <p className="text-xs text-neutral-500">A menu link pointing to the same page as the button is hidden from the desktop bar, so it isn’t shown twice.</p>
      </Card>

      <Card title="Logos" description="Leave empty to use the built-in JSF logo. Upload a transparent PNG or WebP for best results.">
        <div className="grid gap-6 md:grid-cols-2">
          <ImageField label="Logo on light backgrounds (header)" value={h.logoDark} onChange={(logoDark) => setH({ logoDark })} />
          <ImageField label="Logo on dark backgrounds (menu & footer)" value={h.logoLight} onChange={(logoLight) => setH({ logoLight })} />
        </div>
      </Card>

      <Card title="Footer — call to action">
        <TextInput label="Small label" value={f.eyebrow} onChange={(eyebrow) => setF({ eyebrow })} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput label="Heading" value={f.title} onChange={(title) => setF({ title })} />
          <TextInput label="Heading (italic second line)" value={f.accent} onChange={(accent) => setF({ accent })} />
        </div>
        <LinkFields label="First button" value={f.primary} onChange={(primary) => setF({ primary })} />
        <LinkFields label="Second button" value={f.secondary} onChange={(secondary) => setF({ secondary })} />
      </Card>

      <Card title="Footer — columns">
        <TextInput label="Links column heading" value={f.exploreHeading} onChange={(exploreHeading) => setF({ exploreHeading })} />
        <LinkListEditor
          label="Extra footer links"
          value={f.extraLinks}
          onChange={(extraLinks) => setF({ extraLinks })}
          help="Shown after the header menu links, e.g. Blog or a privacy policy."
        />
        <Toggle label="Show the products column" checked={f.showProducts} onChange={(showProducts) => setF({ showProducts })} />
        {f.showProducts && <TextInput label="Products column heading" value={f.productsHeading} onChange={(productsHeading) => setF({ productsHeading })} />}
        <TextInput label="Address heading" value={f.addressHeading} onChange={(addressHeading) => setF({ addressHeading })} />
      </Card>

      <Card title="Footer — bottom line">
        <TextInput label="Registration line" value={f.legalLine} onChange={(legalLine) => setF({ legalLine })} />
        <TextInput label="Copyright line" value={f.copyright} onChange={(copyright) => setF({ copyright })} />
      </Card>
    </div>
  );
}
