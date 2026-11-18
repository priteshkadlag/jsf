import "server-only";
import { randomBytes } from "node:crypto";
import { products } from "@/data/products";
import type { Enquiry } from "@/lib/contact";
import { deleteRecords, listRecords, saveRecord } from "@/lib/cms/storage";

/** A contact-form enquiry as stored on the server and shown in Admin → Enquiries. */
export type StoredEnquiry = Enquiry & {
  id: string;
  priority: boolean;
  receivedAt: string;
};

const KIND = "enquiries";

export async function storeEnquiry(e: Omit<StoredEnquiry, "id">): Promise<StoredEnquiry> {
  // Time first, so ids sort in the order enquiries arrived.
  const id = `${Date.now().toString(36)}${randomBytes(5).toString("hex")}`;
  const record = { ...e, id };
  await saveRecord(KIND, id, record);
  return record;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Every stored enquiry, newest first. */
export async function listEnquiries(): Promise<StoredEnquiry[]> {
  const rows = await listRecords(KIND);
  return rows
    .map(({ id, data }) => {
      const d = (data ?? {}) as Record<string, unknown>;
      return {
        id,
        name: str(d.name),
        email: str(d.email),
        phone: str(d.phone),
        role: str(d.role),
        projectType: str(d.projectType),
        product: str(d.product),
        message: str(d.message),
        priority: d.priority === true,
        receivedAt: str(d.receivedAt),
      };
    })
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export const deleteEnquiries = (ids: string[]) => deleteRecords(KIND, ids);

export const productName = (slug: string) => products.find((p) => p.slug === slug)?.name ?? slug;

/** CSV that opens cleanly in Excel and Google Sheets (UTF-8 BOM, quoted cells, no formula injection). */
export function enquiriesCsv(list: StoredEnquiry[]): string {
  const cell = (v: string) => {
    const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const head = ["Received", "Name", "Email", "Phone", "I am", "Project type", "Product", "Priority", "Message"];
  const rows = list.map((e) =>
    [
      e.receivedAt ? new Date(e.receivedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "",
      e.name,
      e.email,
      e.phone,
      e.role,
      e.projectType,
      e.product ? productName(e.product) : "",
      e.priority ? "Yes" : "",
      e.message,
    ].map(cell),
  );
  return "﻿" + [head.map(cell), ...rows].map((r) => r.join(",")).join("\r\n") + "\r\n";
}
