"use client";

import { BODY_FONTS, DISPLAY_FONTS, fontVar } from "@/lib/cms/font-options";
import { COLOR_KEYS, type ColorKey, type Theme } from "@/lib/cms/types";
import { Btn, Card, Field, inputCls } from "../ui";

const COLOR_INFO: Record<ColorKey, { label: string; help: string }> = {
  ivory: { label: "Page background", help: "Main background and light text on dark sections" },
  paper: { label: "Light panel", help: "Slightly lighter sections, e.g. “What we do”" },
  sand: { label: "Muted panel", help: "Client logo strip and image placeholders" },
  ink: { label: "Body text", help: "Paragraphs, dark buttons and borders" },
  heading: { label: "Headings", help: "Titles on light backgrounds" },
  stone: { label: "Secondary text", help: "Captions, labels and supporting copy" },
  espresso: { label: "Dark sections", help: "Footer, project strip and mobile menu" },
  bark: { label: "Darker sections", help: "Factory section and partner cards" },
  teak: { label: "Accent", help: "Italic highlights, links and hover states" },
  brass: { label: "Accent on dark", help: "Highlights on dark backgrounds" },
  sage: { label: "Soft green", help: "Supporting accent" },
};

/** Ready-made palettes; each only changes colours, never fonts. */
const PRESETS: { name: string; colors: Theme["colors"] }[] = [
  {
    name: "JSF original",
    colors: { ivory: "#e8e3db", paper: "#f1eee8", sand: "#dcd5c9", ink: "#1f2a24", heading: "#30463a", stone: "#565f52", espresso: "#294236", bark: "#20352b", teak: "#5a3e2e", brass: "#b4935a", sage: "#8a9a83" },
  },
  {
    name: "Walnut",
    colors: { ivory: "#efe8de", paper: "#f6f1ea", sand: "#e0d4c4", ink: "#2a201a", heading: "#4a3326", stone: "#6b5d52", espresso: "#3b2a20", bark: "#2c1f17", teak: "#8a5a3c", brass: "#c49a5c", sage: "#9a8f7a" },
  },
  {
    name: "Coastal",
    colors: { ivory: "#e9ecea", paper: "#f3f5f4", sand: "#d6ddd9", ink: "#1c2628", heading: "#23434a", stone: "#55615f", espresso: "#1f3f46", bark: "#173136", teak: "#9a5b3a", brass: "#c9a46a", sage: "#86a19b" },
  },
  {
    name: "Charcoal",
    colors: { ivory: "#e6e4e0", paper: "#f0efec", sand: "#d5d2cc", ink: "#1d1d1b", heading: "#2b2b28", stone: "#5f5e59", espresso: "#2a2a27", bark: "#1f1f1d", teak: "#7a4e32", brass: "#b8955c", sage: "#8f9488" },
  },
];

export default function ThemeEditor({ value: t, onChange }: { value: Theme; onChange: (v: Theme) => void }) {
  const setColor = (k: ColorKey, v: string) => onChange({ ...t, colors: { ...t.colors, [k]: v } });
  const c = t.colors;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Card title="Fonts" description="Headings use the display font; everything else uses the body font.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Display font (headings)">
              {(id) => (
                <select id={id} className={inputCls} value={t.fonts.display} onChange={(e) => onChange({ ...t, fonts: { ...t.fonts, display: e.target.value } })}>
                  {DISPLAY_FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Body font (text)">
              {(id) => (
                <select id={id} className={inputCls} value={t.fonts.body} onChange={(e) => onChange({ ...t, fonts: { ...t.fonts, body: e.target.value } })}>
                  {BODY_FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
        </Card>

        <Card title="Colour presets" description="Start from a palette, then fine-tune individual colours below.">
          <div className="flex flex-wrap gap-3">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => onChange({ ...t, colors: { ...p.colors } })}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 hover:border-neutral-900"
              >
                <span className="flex">
                  {(["ivory", "espresso", "teak", "brass"] as const).map((k) => (
                    <span key={k} className="-ml-1 h-5 w-5 rounded-full border border-white first:ml-0" style={{ background: p.colors[k] }} />
                  ))}
                </span>
                {p.name}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Colours">
          <div className="grid gap-4 sm:grid-cols-2">
            {COLOR_KEYS.map((k) => (
              <Field key={k} label={COLOR_INFO[k].label} help={COLOR_INFO[k].help}>
                {(id) => (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label={`${COLOR_INFO[k].label} colour picker`}
                      value={c[k]}
                      onChange={(e) => setColor(k, e.target.value)}
                      className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-neutral-300 bg-white p-1"
                    />
                    <input
                      id={id}
                      className={`${inputCls} font-mono uppercase`}
                      value={c[k]}
                      maxLength={7}
                      onChange={(e) => {
                        const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
                        setColor(k, v);
                      }}
                    />
                  </div>
                )}
              </Field>
            ))}
          </div>
          {COLOR_KEYS.some((k) => !/^#[0-9a-f]{6}$/i.test(c[k])) && (
            <p className="text-sm text-amber-700">Use 6-digit hex colours like #5a3e2e. Invalid values are replaced with the original colour when you save.</p>
          )}
          <Btn small variant="ghost" onClick={() => onChange({ ...t, colors: { ...PRESETS[0].colors } })}>
            Restore original colours
          </Btn>
        </Card>
      </div>

      {/* Live preview with the chosen colours and fonts (all font files are available to the admin). */}
      <div className="xl:sticky xl:top-24 xl:self-start">
        <Card title="Preview">
          <div className="overflow-hidden rounded-lg border border-neutral-200" style={{ fontFamily: `var(${fontVar(t.fonts.body)})` }}>
            <div className="p-6" style={{ background: c.ivory, color: c.ink }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: c.teak }}>
                Est. 1989 · Tuem, Goa
              </p>
              <p className="mt-3 text-4xl leading-none" style={{ fontFamily: `var(${fontVar(t.fonts.display)})`, color: c.heading }}>
                Architectural woodwork, <em style={{ color: c.teak }}>made to measure</em>
              </p>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: c.stone }}>
                Doors, windows and joinery for Goa’s finest homes, made in our own factory.
              </p>
              <span className="mt-5 inline-block rounded-full px-5 py-2.5 text-xs font-semibold" style={{ background: c.ink, color: c.ivory }}>
                Request a quote →
              </span>
            </div>
            <div className="p-6" style={{ background: c.paper }}>
              <p className="text-2xl" style={{ fontFamily: `var(${fontVar(t.fonts.display)})`, color: c.heading }}>
                Woodwork for every threshold
              </p>
              <div className="mt-3 h-px" style={{ background: c.ink, opacity: 0.14 }} />
              <p className="mt-3 text-sm" style={{ color: c.stone }}>
                01 · Doors &nbsp; 02 · Custom furniture
              </p>
            </div>
            <div className="p-6" style={{ background: c.espresso, color: c.ivory }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: c.brass }}>
                Have a project in mind?
              </p>
              <p className="mt-2 text-3xl leading-tight" style={{ fontFamily: `var(${fontVar(t.fonts.display)})` }}>
                Let’s craft your <em style={{ color: c.brass }}>next entrance.</em>
              </p>
            </div>
            <div className="p-4 text-xs" style={{ background: c.bark, color: c.ivory, opacity: 0.9 }}>
              Factory section · <span style={{ color: c.sage }}>sage</span> · <span style={{ color: c.sand }}>sand</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
