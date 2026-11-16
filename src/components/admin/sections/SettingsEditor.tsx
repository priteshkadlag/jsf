"use client";

import { WEEK_DAYS, type Settings } from "@/lib/cms/types";
import { Card, Field, TextArea, TextInput } from "../ui";

export default function SettingsEditor({ value: s, onChange }: { value: Settings; onChange: (v: Settings) => void }) {
  const set = (patch: Partial<Settings>) => onChange({ ...s, ...patch });
  const addr = (patch: Partial<Settings["address"]>) => set({ address: { ...s.address, ...patch } });
  const award = (patch: Partial<Settings["award"]>) => set({ award: { ...s.award, ...patch } });

  return (
    <div className="space-y-6">
      <Card title="Business" description="Used across the site, in the footer and in Google’s business details.">
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput label="Business name" value={s.name} onChange={(v) => set({ name: v })} />
          <TextInput label="Short name" value={s.shortName} onChange={(v) => set({ shortName: v })} />
          <TextInput label="Tagline" value={s.tagline} onChange={(v) => set({ tagline: v })} />
          <TextInput
            label="Website address"
            value={s.url}
            onChange={(v) => set({ url: v })}
            help="The live domain, e.g. https://www.jsfgroup.co.in. Used for links shared on social media and in the sitemap."
          />
          <TextInput label="Founded (year)" type="number" value={String(s.founded)} onChange={(v) => set({ founded: Number(v) || s.founded })} />
          <TextInput label="Founder" value={s.founder} onChange={(v) => set({ founder: v })} />
        </div>
        <TextArea label="Short description" value={s.description} onChange={(v) => set({ description: v })} max={300} />
      </Card>

      <Card title="Contact details" description="Shown in the header menu, footer, contact page and call buttons.">
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput label="Phone (as displayed)" value={s.phone} placeholder="+91 97639 24949" onChange={(v) => set({ phone: v })} />
          <TextInput
            label="Phone for calls & WhatsApp"
            value={s.phoneDigits}
            placeholder="919763924949"
            onChange={(v) => set({ phoneDigits: v.replace(/\D/g, "") })}
            help="Digits only, starting with the country code (91 for India)."
          />
          <TextInput label="Email" type="email" value={s.email} onChange={(v) => set({ email: v })} />
          <TextInput label="MSME (Udyam) number" value={s.udyam} onChange={(v) => set({ udyam: v })} />
        </div>
      </Card>

      <Card title="Address">
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput label="Address line 1" value={s.address.line1} onChange={(v) => addr({ line1: v })} />
          <TextInput label="Address line 2" value={s.address.line2} onChange={(v) => addr({ line2: v })} />
          <TextInput label="City / state" value={s.address.city} onChange={(v) => addr({ city: v })} />
          <TextInput label="PIN code" value={s.address.postalCode} onChange={(v) => addr({ postalCode: v })} />
        </div>
        <TextInput label="Google Maps link" value={s.mapsHref} onChange={(v) => set({ mapsHref: v })} help="Open your business in Google Maps, choose Share and paste the link here." />
      </Card>

      <Card
        title="Google business details"
        description="Optional, but they help Google show your business correctly in search and Maps. Empty fields are simply left out."
      >
        <TextArea
          label="Official profiles (one link per line)"
          value={s.profiles.join("\n")}
          onChange={(v) => set({ profiles: v.split("\n").map((x) => x.trim()) })}
          rows={4}
          placeholder={"https://g.page/your-business\nhttps://www.instagram.com/…\nhttps://www.linkedin.com/company/…"}
          help="Your Google Business Profile, Instagram, Facebook, LinkedIn, YouTube, IndiaMART or Justdial pages. Only https:// links are kept."
        />
        <Field label="Open on">
          {() => (
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => {
                const on = s.hours.days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set({ hours: { ...s.hours, days: on ? s.hours.days.filter((x) => x !== day) : WEEK_DAYS.filter((x) => x === day || s.hours.days.includes(x)) } })}
                    className={`rounded-full border px-3 py-1 text-sm ${on ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"}`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}
        </Field>
        <div className="grid gap-5 md:grid-cols-4">
          <TextInput label="Opens" type="time" value={s.hours.opens} onChange={(opens) => set({ hours: { ...s.hours, opens } })} />
          <TextInput label="Closes" type="time" value={s.hours.closes} onChange={(closes) => set({ hours: { ...s.hours, closes } })} />
          <TextInput label="Latitude" value={s.geo.lat} placeholder="15.6560" onChange={(lat) => set({ geo: { ...s.geo, lat: lat.trim() } })} />
          <TextInput
            label="Longitude"
            value={s.geo.lng}
            placeholder="73.7920"
            onChange={(lng) => set({ geo: { ...s.geo, lng: lng.trim() } })}
            help="In Google Maps, right-click your factory’s pin: the first line shows both numbers."
          />
        </div>
      </Card>

      <Card title="Award" description="Featured on the home and about pages.">
        <div className="grid gap-5 md:grid-cols-3">
          <TextInput label="Award title" value={s.award.title} onChange={(v) => award({ title: v })} />
          <TextInput label="Awarded by" value={s.award.by} onChange={(v) => award({ by: v })} />
          <TextInput label="Year" type="number" value={String(s.award.year)} onChange={(v) => award({ year: Number(v) || s.award.year })} />
        </div>
      </Card>
    </div>
  );
}
