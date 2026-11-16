"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import {
  SESSION_COOKIE,
  adminConfigured,
  checkPassword,
  clearLoginFailures,
  createSessionToken,
  loginBlocked,
  recordLoginFailure,
  requireAdmin,
} from "@/lib/cms/auth";
import { CMS_TAG } from "@/lib/cms/content";
import { defaultContent } from "@/lib/cms/defaults";
import { normalizeDoc } from "@/lib/cms/normalize";
import { deleteDoc, writeDoc } from "@/lib/cms/storage";
import { DOC_NAMES, type Content, type DocName } from "@/lib/cms/types";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminConfigured()) return { error: "The admin password isn’t set up yet. Add ADMIN_PASSWORD (8+ characters) to the server environment." };
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  if (loginBlocked(ip)) return { error: "Too many attempts. Wait a minute, then try again." };

  const password = String(formData.get("password") ?? "");  if (!checkPassword(password)) {
    recordLoginFailure(ip);
    return { error: "That password isn’t right. Check it and try again." };
  }
  clearLoginFailures(ip);
  const { token, expires } = createSessionToken();
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires,
  });
  return {};
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
}

export type SaveResult = { ok: true; data: unknown } | { ok: false; error: string };

function refreshSite() {
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
}

/** Validates and stores one content document, then refreshes every page that uses it. */
export async function saveDoc<K extends DocName>(name: K, data: Content[K]): Promise<SaveResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Your session has expired. Sign in again to save." };
  }
  if (!DOC_NAMES.includes(name)) return { ok: false, error: "Unknown section." };
  if (JSON.stringify(data ?? null).length > 4_000_000) return { ok: false, error: "This section is too large to save. Remove some items and try again." };

  const clean = normalizeDoc(name, data, defaultContent());
  try {
    await writeDoc(name, clean);
  } catch (err) {
    console.error(`[cms] save ${name} failed`, err);
    return { ok: false, error: "Couldn’t save to storage. Check the server has write access to the content folder, then try again." };
  }
  refreshSite();
  return { ok: true, data: clean };
}

/** Removes the stored document so the section goes back to the site's original content. */
export async function resetDoc(name: DocName): Promise<SaveResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Your session has expired. Sign in again." };
  }
  if (!DOC_NAMES.includes(name)) return { ok: false, error: "Unknown section." };
  await deleteDoc(name);
  refreshSite();
  return { ok: true, data: defaultContent()[name] };
}
