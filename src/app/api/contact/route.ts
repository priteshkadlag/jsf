import { validateEnquiry } from "@/lib/contact";

/**
 * Receives enquiries from the contact form.
 * Set CONTACT_WEBHOOK_URL (e.g. a Zapier/Make/Slack/CRM webhook or your mail service endpoint)
 * to have each enquiry forwarded as JSON. Without it, enquiries are logged on the server.
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

  const enquiry = { ...data, receivedAt: new Date().toISOString(), source: "jsfgroup.co.in" };
  const webhook = process.env.CONTACT_WEBHOOK_URL;

  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiry),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    } catch (err) {
      console.error("[contact] failed to forward enquiry", err);
      return Response.json({ ok: false, error: "We couldn't send your message. Please call or email us directly." }, { status: 502 });
    }
  } else {
    console.info("[contact] new enquiry (set CONTACT_WEBHOOK_URL to forward these)", enquiry);
  }

  return Response.json({ ok: true });
}
