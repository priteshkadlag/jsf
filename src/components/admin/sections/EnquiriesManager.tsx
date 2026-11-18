"use client";

import { useMemo, useState, useTransition } from "react";
import { getEnquiries, removeEnquiries, type EnquiriesResult } from "@/app/admin/actions";
import { products } from "@/data/products";
import type { StoredEnquiry } from "@/lib/enquiries";
import { Btn, inputCls } from "../ui";

const productName = (slug: string) => products.find((p) => p.slug === slug)?.name ?? slug;
const when = (iso: string) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";
const digits = (phone: string) => phone.replace(/[^\d+]/g, "");

/** Admin → Enquiries: every contact-form message, newest first, with delete and CSV export. */
export default function EnquiriesManager({ initial, loadError }: { initial: StoredEnquiry[]; loadError?: string }) {
  const [list, setList] = useState(initial);
  const [error, setError] = useState(loadError ?? "");
  const [query, setQuery] = useState("");
  const [onlyPriority, setOnlyPriority] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter(
      (e) =>
        (!onlyPriority || e.priority) &&
        (!q || [e.name, e.email, e.phone, e.role, e.projectType, productName(e.product), e.message].some((v) => v.toLowerCase().includes(q))),
    );
  }, [list, query, onlyPriority]);

  const apply = (res: EnquiriesResult) => {
    if (!res.ok) return setError(res.error);
    setError("");
    setList(res.list);
    setSelected((s) => new Set([...s].filter((id) => res.list.some((e) => e.id === id))));
  };

  const refresh = () => startTransition(async () => apply(await getEnquiries()));

  const remove = (ids: string[], label: string) => {
    if (!ids.length || !confirm(`Delete ${label}? This can’t be undone. Export a CSV first if you want a copy.`)) return;
    startTransition(async () => apply(await removeEnquiries(ids)));
  };

  const allShownSelected = shown.length > 0 && shown.every((e) => selected.has(e.id));
  const toggleAll = () => setSelected(allShownSelected ? new Set() : new Set(shown.map((e) => e.id)));
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const priorityCount = list.filter((e) => e.priority).length;

  return (
    <div className="space-y-4">
      {/* Summary + actions */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-semibold tabular-nums">{list.length}</p>
          <p className="mt-1 text-sm text-neutral-500">Enquiries</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-semibold tabular-nums">{priorityCount}</p>
          <p className="mt-1 text-sm text-neutral-500">From architects & designers</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
        <label className="sr-only" htmlFor="enquiry-search">
          Search enquiries
        </label>
        <input
          id="enquiry-search"
          type="search"
          className={`${inputCls} min-w-0 flex-1 basis-56`}
          placeholder="Search name, email, phone, message…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="flex items-center gap-2 px-2 text-sm text-neutral-700">
          <input type="checkbox" checked={onlyPriority} onChange={(e) => setOnlyPriority(e.target.checked)} />
          Priority only
        </label>
        <Btn small onClick={refresh} disabled={pending}>
          {pending ? "Loading…" : "Refresh"}
        </Btn>
        <a
          href="/api/admin/enquiries"
          download
          className={`inline-flex items-center justify-center rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 ${list.length ? "" : "pointer-events-none opacity-40"}`}
          aria-disabled={!list.length}
        >
          Export CSV
        </a>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {shown.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-neutral-600">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={allShownSelected} onChange={toggleAll} />
            Select all {shown.length !== list.length ? `${shown.length} shown` : ""}
          </label>
          {selected.size > 0 && (
            <Btn small variant="danger" disabled={pending} onClick={() => remove([...selected], `${selected.size} selected ${selected.size === 1 ? "enquiry" : "enquiries"}`)}>
              Delete selected ({selected.size})
            </Btn>
          )}
        </div>
      )}

      {/* List */}
      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
          {list.length ? "No enquiries match your search." : "No enquiries yet. Messages sent from the website’s contact form will appear here."}
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((e) => (
            <li key={e.id} className={`rounded-xl border bg-white p-4 shadow-sm md:p-5 ${selected.has(e.id) ? "border-neutral-900" : "border-neutral-200"}`}>
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1.5" checked={selected.has(e.id)} onChange={() => toggle(e.id)} aria-label={`Select enquiry from ${e.name}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-semibold text-neutral-900">
                      {e.name}
                      {e.priority && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 align-middle text-xs font-medium text-amber-800">Priority</span>}
                    </p>
                    <time dateTime={e.receivedAt} className="text-xs text-neutral-500">
                      {when(e.receivedAt)}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">
                    {[e.role, e.projectType, e.product && productName(e.product)].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <a href={`mailto:${e.email}`} className="break-all text-neutral-900 underline underline-offset-2 hover:text-neutral-600">
                      {e.email}
                    </a>
                    {e.phone && (
                      <>
                        <a href={`tel:${digits(e.phone)}`} className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600">
                          {e.phone}
                        </a>
                        <a
                          href={`https://wa.me/${digits(e.phone).replace(/^\+/, "").replace(/^(?=\d{10}$)/, "91")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
                        >
                          WhatsApp
                        </a>
                      </>
                    )}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-800">{e.message}</p>
                </div>
                <Btn small variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" disabled={pending} title={`Delete enquiry from ${e.name}`} onClick={() => remove([e.id], `the enquiry from ${e.name}`)}>
                  ✕
                </Btn>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
