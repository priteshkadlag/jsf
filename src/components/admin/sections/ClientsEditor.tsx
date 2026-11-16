"use client";

import type { ClientsContent } from "@/lib/cms/types";
import { ImageField } from "../media";
import { DragHandle, SortableList, toTop } from "../Sortable";
import { Btn, Card, RemoveButton, TextArea, TextInput } from "../ui";

export default function ClientsEditor({ value: c, onChange, developers }: { value: ClientsContent; onChange: (v: ClientsContent) => void; developers: string[] }) {
  const setList = (list: ClientsContent["list"]) => onChange({ ...c, list });
  const setPartners = (partners: ClientsContent["partners"]) => onChange({ ...c, partners });

  return (
    <div className="space-y-6">
      <Card
        title={`Client logos (${c.list.length})`}
        description="Drag ⠿ to change the order — it’s the order of the logo strip and the Clients page. Use logos on a white or transparent background."
        actions={
          <Btn variant="primary" small onClick={() => setList([{ name: "", logo: "" }, ...c.list])}>
            + Add client
          </Btn>
        }
      >
        <SortableList items={c.list} onChange={setList} layout="grid" className="grid gap-3 md:grid-cols-2" itemClassName="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          {(client, i) => (
            <>
              <DragHandle label={client.name || "client"} className="self-stretch" />
              <div className="min-w-0 flex-1 space-y-3">
                <TextInput label="Client name" value={client.name} onChange={(name) => setList(c.list.map((x, j) => (j === i ? { ...x, name } : x)))} />
                <ImageField compact label="Logo" value={client.logo} onChange={(logo) => setList(c.list.map((x, j) => (j === i ? { ...x, logo } : x)))} help="Without a logo, the name is shown." />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs tabular-nums text-neutral-400">{i + 1}</span>
                {i > 0 && (
                  <Btn small variant="ghost" title={`Move ${client.name || "client"} to the top`} onClick={() => setList(toTop(c.list, i))}>
                    ⤒
                  </Btn>
                )}
                <RemoveButton name={client.name || "this client"} onRemove={() => setList(c.list.filter((_, j) => j !== i))} />
              </div>
            </>
          )}
        </SortableList>
      </Card>

      <Card
        title="Key partners"
        description={
          <>
            Large cards on the Clients page, in this order. A partner appears only when its name matches a project’s developer
            {developers.length ? ` (current developers: ${developers.join(", ")})` : ""}.
          </>
        }
        actions={
          <Btn small onClick={() => setPartners([...c.partners, { name: "", logo: "", text: "" }])}>
            + Add partner
          </Btn>
        }
      >
        <SortableList items={c.partners} onChange={setPartners} className="space-y-3" itemClassName="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          {(p, i) => (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <DragHandle label={p.name || "partner"} />
                  <span className="text-xs font-semibold text-neutral-500">Partner {i + 1}</span>
                </div>
                <RemoveButton name={p.name || "this partner"} onRemove={() => setPartners(c.partners.filter((_, j) => j !== i))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput label="Name (must match the developer)" value={p.name} onChange={(name) => setPartners(c.partners.map((x, j) => (j === i ? { ...x, name } : x)))} />
                <ImageField compact label="Logo" value={p.logo} onChange={(logo) => setPartners(c.partners.map((x, j) => (j === i ? { ...x, logo } : x)))} />
              </div>
              <div className="mt-4">
                <TextArea label="Description" value={p.text} onChange={(text) => setPartners(c.partners.map((x, j) => (j === i ? { ...x, text } : x)))} rows={2} />
              </div>
              {p.name && !developers.some((d) => d.toLowerCase() === p.name.toLowerCase()) && (
                <p className="mt-2 text-xs text-amber-700">No project lists “{p.name}” as its developer yet, so this card is hidden.</p>
              )}
            </>
          )}
        </SortableList>
      </Card>
    </div>
  );
}
