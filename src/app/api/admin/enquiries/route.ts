import { connection } from "next/server";
import { isAdmin } from "@/lib/cms/auth";
import { enquiriesCsv, listEnquiries } from "@/lib/enquiries";

/** GET /api/admin/enquiries — downloads every enquiry as a CSV file (admin only). */
export async function GET() {
  await connection();
  if (!(await isAdmin())) return new Response("Sign in to the admin first.", { status: 401 });
  const csv = enquiriesCsv(await listEnquiries());
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jsf-enquiries-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
