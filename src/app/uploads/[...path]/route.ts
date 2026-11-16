import { promises as fs } from "node:fs";
import { resolveUploadPath } from "@/lib/cms/storage";

const TYPES: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  avif: "image/avif",
};

/**
 * Serves images uploaded through the admin (local storage mode). Next.js only serves files that
 * were in /public at build time, so runtime uploads live in ./content/uploads and come through here.
 * File names are unique, so they can be cached forever.
 */
export async function GET(_req: Request, { params }: RouteContext<"/uploads/[...path]">) {
  const { path } = await params;
  const file = resolveUploadPath(path);
  const type = TYPES[file?.split(".").pop()?.toLowerCase() ?? ""];
  if (!file || !type) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(file);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
