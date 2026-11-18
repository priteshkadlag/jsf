import { validateEnquiry } from "@/lib/contact";
import { storeEnquiry } from "@/lib/enquiries";

/**
 * Receives enquiries from the contact form. Each one is saved on the server and listed in
 * Admin → Enquiries (view, delete, export CSV). Optionally set CONTACT_WEBHOOK_URL (Zapier/Make/
 * Slack/CRM or a mail service) to also get each enquiry forwarded as JSON.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never fill the hidden "company" field.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return Response.json({ ok: true });
  }

  const { data, errors } = validateEnquiry(body);
  if (!data) return Response.json({ ok: false, errors }, { status: 422 });

  // Architects and interior designers are JSF's main audience: flag them for a quicker reply.
  const priority = data.role === "Architect" || data.role === "Interior designer";
  const enquiry = { ...data, priority, receivedAt: new Date().toISOString() };

  let stored = false;
  try {
    await storeEnquiry(enquiry);
    stored = true;
  } catch (err) {
    console.error("[contact] could not save enquiry", err, enquiry);
  }

  let forwarded = false;
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...enquiry, source: new URL(request.url).host }),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
      forwarded = true;
    } catch (err) {
      console.error("[contact] failed to forward enquiry", err);
    }
  }

  // Only tell the visitor it worked if the enquiry actually reached us somewhere.
  if (!stored && !forwarded) {
    return Response.json({ ok: false, error: "We couldn't send your message. Please call or email us directly." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
