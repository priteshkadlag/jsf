import { isAdmin } from "@/lib/cms/auth";
import { slugify } from "@/lib/cms/normalize";
import { deleteUpload, listUploads, saveUpload } from "@/lib/cms/storage";

/** Hosts such as Vercel refuse request bodies over 4.5 MB, so stay safely under that. */
const MAX_BYTES = 4 * 1024 * 1024;

/** Identify the image type from its first bytes rather than trusting the file name or browser. */
function sniff(b: Buffer): { ext: string; type: string } | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) return { ext: "png", type: "image/png" };
  if (b.subarray(0, 4).toString("ascii") === "GIF8") return { ext: "gif", type: "image/gif" };
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return { ext: "webp", type: "image/webp" };
  const brand = b.subarray(4, 12).toString("ascii");
  if (brand === "ftypavif" || brand === "ftypavis") return { ext: "avif", type: "image/avif" };
  return null;
}

/** Same-origin check for state-changing requests (the session cookie is also SameSite=strict). */
function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

const deny = () => Response.json({ error: "Your session has expired. Sign in again." }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return deny();
  return Response.json({ uploads: await listUploads() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Cross-site request refused." }, { status: 403 });
  if (!(await isAdmin())) return deny();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "The upload didn’t arrive complete. Try again." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose an image to upload." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "That image is over 4 MB. Export a smaller version and try again." }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const kind = sniff(bytes);
  if (!kind) return Response.json({ error: "Only JPEG, PNG, WebP, AVIF or GIF images can be uploaded." }, { status: 415 });

  const w = Math.round(Number(form.get("width")));
  const h = Math.round(Number(form.get("height")));
  const dims = w > 0 && h > 0 && w < 20000 && h < 20000 ? `-${w}x${h}` : "";
  const base = slugify(String(form.get("name") ?? file.name).replace(/\.[a-z0-9]+$/i, "").replace(/-\d+x\d+$/, "")) || "image";

  try {
    const url = await saveUpload(`${base.slice(0, 60)}${dims}.${kind.ext}`, bytes, kind.type);
    return Response.json({ url });
  } catch (err) {
    console.error("[cms] upload failed", err);
    return Response.json({ error: "Couldn’t store the image. Check the server’s storage settings and try again." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Cross-site request refused." }, { status: 403 });
  if (!(await isAdmin())) return deny();
  const url = new URL(req.url).searchParams.get("url") ?? "";
  try {
    await deleteUpload(url);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "That file couldn’t be deleted." }, { status: 400 });
  }
}
