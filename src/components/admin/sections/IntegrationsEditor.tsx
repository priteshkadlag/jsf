"use client";

import { useState } from "react";
import { SEO_PAGES } from "@/lib/cms/defaults";
import type { Integrations } from "@/lib/cms/types";
import { Btn, Card, Field, TextArea, TextInput, Toggle, inputCls } from "../ui";

/** Same formats the server enforces; a value that doesn't match is dropped on save. */
const FORMATS = {
  gaId: { re: /^G-[A-Z0-9]{4,20}$/i, example: "G-AB12CD34EF" },
  gtmId: { re: /^GTM-[A-Z0-9]{4,12}$/i, example: "GTM-AB12CD3" },
  metaPixelId: { re: /^\d{6,20}$/, example: "123456789012345" },
  clarityId: { re: /^[a-z0-9]{6,20}$/i, example: "abcd1234ef" },
  pagespeedKey: { re: /^[A-Za-z0-9_-]{20,60}$/, example: "" },
} as const;

function IdInput({ label, field, value, onChange, help }: { label: string; field: keyof typeof FORMATS; value: string; onChange: (v: string) => void; help: string }) {
  const f = FORMATS[field];
  const bad = value.trim() !== "" && !f.re.test(value.trim());
  return (
    <div>
      <TextInput label={label} value={value} placeholder={f.example} onChange={(v) => onChange(v.trim())} help={help} />
      {bad && <p className="mt-1 text-xs font-medium text-amber-700">This doesn’t look like a valid ID{f.example ? ` (e.g. ${f.example})` : ""}. It won’t be saved as is.</p>}
      {!bad && value.trim() && <p className="mt-1 text-xs text-emerald-700">✓ Active on every public page after saving</p>}
    </div>
  );
}

/* ───────────── PageSpeed Insights ───────────── */

type Result = {
  url: string;
  strategy: string;
  scores: { label: string; score: number }[];
  metrics: { label: string; value: string; score: number | null }[];
};

const CATEGORIES = [
  ["performance", "Performance"],
  ["accessibility", "Accessibility"],
  ["best-practices", "Best practices"],
  ["seo", "SEO"],
] as const;
const METRICS = [
  ["largest-contentful-paint", "Largest Contentful Paint"],
  ["total-blocking-time", "Total Blocking Time"],
  ["cumulative-layout-shift", "Cumulative Layout Shift"],
  ["first-contentful-paint", "First Contentful Paint"],
  ["speed-index", "Speed Index"],
] as const;

const tone = (s: number) => (s >= 0.9 ? "text-emerald-700 border-emerald-600" : s >= 0.5 ? "text-amber-700 border-amber-500" : "text-red-700 border-red-600");

function PageSpeedPanel({ siteUrl, apiKey }: { siteUrl: string; apiKey: string }) {
  const [path, setPath] = useState("/");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const target = `${siteUrl.replace(/\/+$/, "")}${path === "/" ? "/" : path}`;
  const local = /localhost|127\.0\.0\.1/.test(siteUrl);

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      const q = new URLSearchParams({ url: target, strategy });
      CATEGORIES.forEach(([c]) => q.append("category", c.toUpperCase().replace("-", "_")));
      if (apiKey && FORMATS.pagespeedKey.re.test(apiKey)) q.set("key", apiKey);
      const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${q}`);
      const json = await res.json();
      if (!res.ok) {
        const msg: string = json?.error?.message ?? "";
        throw new Error(
          res.status === 429 || /quota/i.test(msg)
            ? "Google’s free test limit was reached. Wait a few minutes, or add a PageSpeed API key below, then try again."
            : msg
              ? `Google couldn’t test this page: ${msg}`
              : "The test didn’t finish. Check the website address in Site info, then try again.",
        );
      }
      const lh = json.lighthouseResult;
      setResult({
        url: target,
        strategy,
        scores: CATEGORIES.map(([k, label]) => ({ label, score: lh.categories[k]?.score ?? 0 })),
        metrics: METRICS.map(([k, label]) => ({ label, value: lh.audits[k]?.displayValue ?? "–", score: lh.audits[k]?.score ?? null })),
      });
    } catch (e) {
      setError((e as Error).message || "The test didn’t finish. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Google PageSpeed test" description="Runs Google’s Lighthouse test on the live website — the same scores as pagespeed.web.dev. A test takes about 20–40 seconds.">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Page">
          {(fid) => (
            <select id={fid} className={`${inputCls} w-48`} value={path} onChange={(e) => setPath(e.target.value)}>
              {SEO_PAGES.map((p) => (
                <option key={p.path} value={p.path}>
                  {p.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <div role="group" aria-label="Device" className="flex rounded-md border border-neutral-300 p-0.5 text-sm">
          {(["mobile", "desktop"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={strategy === s} onClick={() => setStrategy(s)} className={`rounded px-3 py-1.5 capitalize ${strategy === s ? "bg-neutral-900 text-white" : "text-neutral-600"}`}>
              {s}
            </button>
          ))}
        </div>
        <Btn variant="primary" onClick={run} disabled={busy || local}>
          {busy ? "Testing… (up to a minute)" : "Run test"}
        </Btn>
        <a href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(target)}`} target="_blank" rel="noreferrer" className="text-sm text-neutral-600 underline underline-offset-4">
          Open on pagespeed.web.dev ↗
        </a>
      </div>
      <p className="text-xs text-neutral-500">
        Testing: <code>{target}</code>
        {local && " — Google can only test a public website. Set the live address under Site info."}
      </p>
      {error && <p className="text-sm text-red-700">{error}</p>}

      {result && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {result.scores.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 p-4">
                <span className={`flex h-16 w-16 items-center justify-center rounded-full border-4 text-xl font-semibold tabular-nums ${tone(s.score)}`}>{Math.round(s.score * 100)}</span>
                <span className="text-center text-sm text-neutral-700">{s.label}</span>
              </div>
            ))}
          </div>
          <table className="w-full text-sm">
            <caption className="sr-only">Lab metrics</caption>
            <tbody>
              {result.metrics.map((m) => (
                <tr key={m.label} className="border-t border-neutral-200">
                  <th scope="row" className="py-2 text-left font-normal text-neutral-700">
                    {m.label}
                  </th>
                  <td className={`py-2 text-right font-medium tabular-nums ${m.score === null ? "" : tone(m.score).split(" ")[0]}`}>{m.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-neutral-500">
            {result.strategy === "mobile" ? "Mobile" : "Desktop"} result for {result.url}. Scores vary a little between runs; 90+ is good, 50–89 needs work.
          </p>
        </div>
      )}
    </Card>
  );
}

/* ───────────── Editor ───────────── */

export default function IntegrationsEditor({ value: i, onChange, siteUrl }: { value: Integrations; onChange: (v: Integrations) => void; siteUrl: string }) {
  const set = (p: Partial<Integrations>) => onChange({ ...i, ...p });
  const ver = (p: Partial<Integrations["verification"]>) => set({ verification: { ...i.verification, ...p } });

  return (
    <div className="space-y-6">
      <PageSpeedPanel siteUrl={siteUrl} apiKey={i.pagespeedKey} />

      <Card title="Analytics & tracking" description="Paste only the ID — the official code is added for you on every public page (never in the admin). Leave a field empty to switch that tool off.">
        <div className="grid gap-5 md:grid-cols-2">
          <IdInput label="Google Analytics 4 — Measurement ID" field="gaId" value={i.gaId} onChange={(gaId) => set({ gaId })} help="Analytics → Admin → Data streams → your website. Starts with G-." />
          <IdInput
            label="Google Tag Manager — Container ID"
            field="gtmId"
            value={i.gtmId}
            onChange={(gtmId) => set({ gtmId })}
            help="Starts with GTM-. If you add GA4 inside Tag Manager, leave the GA4 field empty so visits aren’t counted twice."
          />
          <IdInput label="Meta (Facebook) Pixel ID" field="metaPixelId" value={i.metaPixelId} onChange={(metaPixelId) => set({ metaPixelId })} help="Events Manager → Data sources → your pixel. Numbers only." />
          <IdInput label="Microsoft Clarity — Project ID" field="clarityId" value={i.clarityId} onChange={(clarityId) => set({ clarityId })} help="Free heatmaps and session recordings. Clarity → Settings → Overview." />
        </div>
      </Card>

      <Card title="Site verification (meta tags)" description="Proves you own the site. Paste the code from each service — the whole <meta …> tag also works; only the code is kept.">
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput label="Google Search Console" value={i.verification.google} onChange={(google) => ver({ google })} help="Search Console → Add property → HTML tag." />
          <TextInput label="Bing Webmaster Tools" value={i.verification.bing} onChange={(bing) => ver({ bing })} help="The msvalidate.01 code." />
          <TextInput label="Facebook / Meta domain verification" value={i.verification.facebook} onChange={(facebook) => ver({ facebook })} help="Business settings → Brand safety → Domains → Meta-tag." />
          <TextInput label="Pinterest" value={i.verification.pinterest} onChange={(pinterest) => ver({ pinterest })} help="The p:domain_verify code." />
        </div>
      </Card>

      <Card title="Custom code" description="For anything else — chat widgets, review badges, other tracking tools. Code is added to every public page exactly as pasted.">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Only paste code from services you trust. A broken snippet can stop the site working — if that happens, switch custom code off below and save.
        </div>
        <Toggle label="Custom code is on" checked={i.customCodeEnabled} onChange={(customCodeEnabled) => set({ customCodeEnabled })} help="Turn off to disable both boxes without deleting the code." />
        <TextArea
          label="Code at the start of the page"
          value={i.headCode}
          onChange={(headCode) => set({ headCode })}
          rows={7}
          mono
          placeholder={'<script src="https://example.com/widget.js" async></script>'}
          help="For scripts and styles a service asks you to put “in the <head>”. (Verification meta tags go in the fields above.)"
        />
        <TextArea
          label="Code at the end of the page"
          value={i.bodyCode}
          onChange={(bodyCode) => set({ bodyCode })}
          rows={7}
          mono
          placeholder={"<!-- e.g. chat widget -->\n<script>…</script>"}
          help="For snippets a service asks you to put “before </body>”, like chat widgets."
        />
      </Card>

      <Card title="PageSpeed API key (optional)" description="Google allows a few free tests without a key. If tests start failing with a limit message, create a free key and paste it here.">
        <IdInput
          label="API key"
          field="pagespeedKey"
          value={i.pagespeedKey}
          onChange={(pagespeedKey) => set({ pagespeedKey })}
          help="Google Cloud Console → APIs & Services → enable “PageSpeed Insights API” → Credentials → Create API key. Only used inside this admin."
        />
      </Card>
    </div>
  );
}
