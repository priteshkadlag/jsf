"use client";

import { useId, type ReactNode } from "react";
import { DragHandle, SortableList } from "./Sortable";

/*
 * Admin building blocks. The admin deliberately uses Tailwind's neutral palette instead of the
 * site's theme tokens, so a bad colour choice in Theme can never make the admin unreadable.
 */

export const inputCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 disabled:bg-neutral-100";

export function Field({
  label,
  help,
  children,
  count,
  max,
}: {
  label: string;
  help?: ReactNode;
  children: (id: string) => ReactNode;
  count?: number;
  max?: number;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-neutral-800">
          {label}
        </label>
        {count !== undefined && max !== undefined && (
          <span className={`text-xs tabular-nums ${count > max ? "font-semibold text-amber-700" : "text-neutral-500"}`}>
            {count}/{max}
          </span>
        )}
      </div>
      {children(id)}
      {help && <p className="text-xs leading-relaxed text-neutral-500">{help}</p>}
    </div>
  );
}

type TextProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  help?: ReactNode;
  placeholder?: string;
  type?: string;
  max?: number;
};

export function TextInput({ label, value, onChange, help, placeholder, type = "text", max }: TextProps) {
  return (
    <Field label={label} help={help} count={max ? value.length : undefined} max={max}>
      {(id) => <input id={id} type={type} className={inputCls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
    </Field>
  );
}

export function TextArea({ label, value, onChange, help, placeholder, rows = 3, max, mono }: TextProps & { rows?: number; mono?: boolean }) {
  return (
    <Field label={label} help={help} count={max ? value.length : undefined} max={max}>
      {(id) => (
        <textarea
          id={id}
          rows={rows}
          className={`${inputCls} resize-y leading-relaxed ${mono ? "font-mono text-[13px]" : ""}`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

export function Toggle({ label, checked, onChange, help }: { label: string; checked: boolean; onChange: (v: boolean) => void; help?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-emerald-600" : "bg-neutral-300"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </button>
      <div>
        <label htmlFor={id} className="text-sm font-medium text-neutral-800">
          {label}
        </label>
        {help && <p className="text-xs text-neutral-500">{help}</p>}
      </div>
    </div>
  );
}

export function Card({ title, description, children, actions }: { title?: string; description?: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-semibold text-neutral-900">{title}</h3>}
            {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

const btn = {
  primary: "bg-neutral-900 text-white hover:bg-neutral-700 disabled:bg-neutral-400",
  secondary: "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 disabled:text-neutral-400",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  ghost: "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
};

export function Btn({
  children,
  onClick,
  variant = "secondary",
  type = "button",
  disabled,
  small,
  title,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: keyof typeof btn;
  type?: "button" | "submit";
  disabled?: boolean;
  small?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed ${
        small ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm"
      } ${btn[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/** Remove button for an item in a list (asks first, naming the item). */
export function RemoveButton({ onRemove, name }: { onRemove: () => void; name: string }) {
  return (
    <Btn
      small
      variant="ghost"
      title={`Remove ${name}`}
      className="text-red-600 hover:bg-red-50 hover:text-red-700"
      onClick={() => {
        if (confirm(`Remove “${name}”? You can undo this by not saving.`)) onRemove();
      }}
    >
      ✕
    </Btn>
  );
}

export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const DRAG_HINT = <p className="text-xs text-neutral-500">Drag ⠿ to change the order.</p>;

/** Editable list of { title, text } cards, e.g. "Why choose us" reasons or process steps. */
export function TitledListEditor({
  label,
  value,
  onChange,
  itemName = "item",
}: {
  label: string;
  value: { title: string; text: string }[];
  onChange: (v: { title: string; text: string }[]) => void;
  itemName?: string;
}) {
  const set = (i: number, patch: Partial<{ title: string; text: string }>) => onChange(value.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {value.length > 1 && DRAG_HINT}
      </div>
      <SortableList items={value} onChange={onChange} className="space-y-3" itemClassName="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        {(item, i) => (
          <>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <DragHandle label={item.title || `${itemName} ${i + 1}`} />
                <span className="text-xs font-semibold text-neutral-500">
                  {itemName} {i + 1}
                </span>
              </div>
              <RemoveButton name={item.title || `${itemName} ${i + 1}`} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
            </div>
            <div className="grid gap-3">
              <TextInput label="Title" value={item.title} onChange={(v) => set(i, { title: v })} />
              <TextArea label="Text" value={item.text} onChange={(v) => set(i, { text: v })} rows={2} />
            </div>
          </>
        )}
      </SortableList>
      <Btn small onClick={() => onChange([...value, { title: "", text: "" }])}>
        + Add {itemName}
      </Btn>
    </div>
  );
}

/** Editable list of { label, href } links. */
export function LinkListEditor({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: { label: string; href: string }[];
  onChange: (v: { label: string; href: string }[]) => void;
  help?: ReactNode;
}) {
  const set = (i: number, patch: Partial<{ label: string; href: string }>) => onChange(value.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {help && <p className="mt-1 text-xs text-neutral-500">{help}</p>}
        {value.length > 1 && DRAG_HINT}
      </div>
      <SortableList items={value} onChange={onChange} className="space-y-2" itemClassName="flex items-end gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        {(item, i) => (
          <>
            <DragHandle label={item.label || `link ${i + 1}`} className="mb-1.5 self-end py-1.5" />
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
              <TextInput label="Label" value={item.label} onChange={(v) => set(i, { label: v })} />
              <TextInput label="Link" value={item.href} placeholder="/about" onChange={(v) => set(i, { href: v })} />
            </div>
            <div className="mb-1">
              <RemoveButton name={item.label || `link ${i + 1}`} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
            </div>
          </>
        )}
      </SortableList>
      <Btn small onClick={() => onChange([...value, { label: "", href: "" }])}>
        + Add link
      </Btn>
    </div>
  );
}

export const LINK_HELP = (
  <>
    Use a page path like <code>/projects</code>, a full web address, or the shortcuts <code>whatsapp</code>, <code>phone</code> or <code>email</code>.
  </>
);
