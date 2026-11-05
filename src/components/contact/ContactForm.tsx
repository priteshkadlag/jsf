"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { products } from "@/data/products";
import { projectTypes, roles, validateEnquiry, type FieldErrors } from "@/lib/contact";
import { site } from "@/data/site";

type Status = "idle" | "sending" | "sent" | "error";

const inputCls =
  "peer w-full border-0 border-b border-ink/25 bg-transparent px-0 pb-3 pt-6 text-lg text-ink outline-none transition-colors placeholder:text-transparent focus:border-teak focus:ring-0 aria-[invalid=true]:border-red-700";
const labelCls =
  "pointer-events-none absolute left-0 top-6 origin-left text-stone transition-all duration-300 peer-focus:top-0 peer-focus:text-xs peer-focus:text-teak peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs";

function Field({ name, label, type = "text", error, required, autoComplete }: { name: string; label: string; type?: string; error?: string; required?: boolean; autoComplete?: string }) {
  return (
    <div className="relative">
      <input
        id={name}
        name={name}
        type={type}
        placeholder={label}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={inputCls}
      />
      <label htmlFor={name} className={labelCls}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {error && (
        <p id={`${name}-error`} className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const productRef = useRef<HTMLSelectElement>(null);

  // Preselect a product when arriving from "Enquire about …" links (?product=slug).
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("product");
    if (slug && productRef.current && products.some((p) => p.slug === slug)) productRef.current.value = slug;
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const { errors: clientErrors } = validateEnquiry(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) {
      const first = Object.keys(clientErrors)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        setMessage(json.error ?? "Please check the highlighted fields.");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("sent");
    } catch {
      setMessage(`Something went wrong. Please call us on ${site.phone} or email ${site.email}.`);
      setStatus("error");
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            role="status"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[420px] flex-col items-start justify-center"
          >
            <p className="eyebrow text-teak">Message received</p>
            <h2 className="mt-6 font-serif text-headline">
              Thank you. <em className="text-teak">We&rsquo;ll be in touch.</em>
            </h2>
            <p className="mt-6 max-w-md text-stone">Our team usually replies within one working day. For anything urgent, call {site.phone}.</p>
            <button type="button" onClick={() => setStatus("idle")} className="link-underline mt-10 text-sm font-semibold">
              Send another enquiry
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" noValidate onSubmit={onSubmit} initial={false} exit={{ opacity: 0, y: -20 }} className="grid gap-10">
            <div className="grid gap-10 md:grid-cols-2">
              <Field name="name" label="Your name" required autoComplete="name" error={errors.name} />
              <Field name="email" label="Email" type="email" required autoComplete="email" error={errors.email} />
              <Field name="phone" label="Phone (optional)" type="tel" autoComplete="tel" error={errors.phone} />
              <div className="relative">
                <label htmlFor="role" className="block text-xs text-stone">
                  You are
                </label>
                <select
                  id="role"
                  name="role"
                  defaultValue=""
                  aria-invalid={errors.role ? true : undefined}
                  className="mt-1 w-full border-0 border-b border-ink/25 bg-transparent px-0 pb-3 pt-2 text-lg focus:border-teak focus:ring-0"
                >
                  <option value="">Select…</option>
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <label htmlFor="projectType" className="block text-xs text-stone">
                  Project type
                </label>
                <select id="projectType" name="projectType" defaultValue="" className="mt-1 w-full border-0 border-b border-ink/25 bg-transparent px-0 pb-3 pt-2 text-lg focus:border-teak focus:ring-0">
                  <option value="">Select…</option>
                  {projectTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="product" className="block text-xs text-stone">
                I&rsquo;m interested in
              </label>
              <select
                ref={productRef}
                id="product"
                name="product"
                defaultValue=""
                aria-invalid={errors.product ? true : undefined}
                className="mt-1 w-full border-0 border-b border-ink/25 bg-transparent px-0 pb-3 pt-2 text-lg focus:border-teak focus:ring-0"
              >
                <option value="">Not sure yet</option>
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Tell us about your project"
                required
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={`${inputCls} resize-none`}
              />
              <label htmlFor="message" className={labelCls}>
                Tell us about your project<span aria-hidden="true"> *</span>
              </label>
              {errors.message && (
                <p id="message-error" className="mt-2 text-sm text-red-700">
                  {errors.message}
                </p>
              )}
            </div>
            {/* Honeypot */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={status === "sending"}
                className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-sm font-semibold tracking-wide text-ivory transition-colors duration-500 hover:bg-teak disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send enquiry"}
                <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <p className="text-xs text-stone">We only use your details to respond to this enquiry.</p>
            </div>
            <p role="alert" className="min-h-[1.5rem] text-sm text-red-700">
              {status === "error" ? message : ""}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
