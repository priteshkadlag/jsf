import { Suspense } from "react";
import { connection } from "next/server";
import AdminApp from "@/components/admin/AdminApp";
import LoginForm from "@/components/admin/LoginForm";
import { adminConfigured, isAdmin } from "@/lib/cms/auth";
import { loadContent } from "@/lib/cms/content";
import { storageMode } from "@/lib/cms/storage";
import { builtInMedia } from "@/lib/media";
import { listEnquiries, type StoredEnquiry } from "@/lib/enquiries";

/**
 * /admin — content management. Reading the session cookie happens at request time, so the gate
 * sits inside a Suspense boundary (required with Cache Components) and the admin always reads
 * the latest stored content rather than the cached copy the public pages use.
 */
export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<p className="p-8 font-sans text-sm text-neutral-500">Loading admin…</p>}>
      <AdminGate searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminGate({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  // Always request-time: the session check compares the cookie expiry with the current time.
  await connection();
  const signedIn = await isAdmin();
  if (!signedIn) {
    const { settings } = await loadContent();
    return <LoginForm configured={adminConfigured()} siteName={settings.name} />;
  }
  const content = await loadContent();
  // ?section=projects opens that section directly (handy for bookmarks).
  const { section } = await searchParams;
  let enquiries: StoredEnquiry[] = [];
  let enquiriesError: string | undefined;
  try {
    enquiries = await listEnquiries();
  } catch (err) {
    console.error("[cms] list enquiries failed", err);
    enquiriesError = "Couldn’t load enquiries from storage. Press Refresh to try again.";
  }
  return <AdminApp enquiries={enquiries} enquiriesError={enquiriesError} initialSection={typeof section === "string" ? section : undefined} initial={content} builtIns={builtInMedia()} storage={storageMode()} />;
}
