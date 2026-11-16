"use client";

import { useState } from "react";
import { TEXT_GROUPS, type TextField } from "@/lib/cms/text-fields";
import type { Texts, TitledText } from "@/lib/cms/types";
import { ImageField } from "../media";
import { Btn, Card, TextArea, TextInput, TitledListEditor } from "../ui";

const PAGES = [...new Set(TEXT_GROUPS.map((g) => g.page))];

export default function TextsEditor({ value, onChange }: { value: Texts; onChange: (v: Texts) => void }) {
  const [page, setPage] = useState(PAGES[0]);

  const current = (f: TextField) => value[f.key] ?? f.default;
  const changed = (f: TextField) => f.key in value && JSON.stringify(value[f.key]) !== JSON.stringify(f.default);
  const set = (key: string, v: string | TitledText[]) => onChange({ ...value, [key]: v });
  const reset = (key: string) => {
    const next = { ...value };
    delete next[key];
    onChange(next);
  };

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label="Choose a page" className="flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={page === p}
            onClick={() => setPage(p)}
            className={`rounded-full px-3 py-1.5 text-sm ${page === p ? "bg-neutral-900 text-white" : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"}`}
          >
            {p}
          </button>
        ))}
      </div>

      {TEXT_GROUPS.filter((g) => g.page === page).map((g) => (
        <Card key={g.id} title={g.title}>
          {g.fields.map((f) => {
            const v = current(f);
            const resetBtn = changed(f) && (
              <Btn small variant="ghost" onClick={() => reset(f.key)}>
                ↺ Restore original
              </Btn>
            );
            if (f.type === "list")
              return (
                <div key={f.key} className="space-y-2">
                  <TitledListEditor label={f.label} value={v as TitledText[]} onChange={(x) => set(f.key, x)} itemName="card" />
                  {resetBtn}
                </div>
              );
            if (f.type === "image")
              return (
                <div key={f.key} className="flex flex-wrap items-end gap-3">
                  <ImageField label={f.label} value={v as string} onChange={(x) => set(f.key, x || f.default)} allowEmpty={false} help={f.help} />
                  {resetBtn}
                </div>
              );
            const Input = f.type === "textarea" ? TextArea : TextInput;
            return (
              <div key={f.key} className="space-y-1">
                <Input label={f.label} value={v as string} onChange={(x) => set(f.key, x)} help={f.help} />
                {resetBtn}
              </div>
            );
          })}
        </Card>
      ))}
    </div>
  );
}
