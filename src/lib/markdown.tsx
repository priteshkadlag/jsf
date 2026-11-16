import type { ReactNode } from "react";
import Picture from "@/components/ui/Picture";
import { safeHref, safeImage } from "@/lib/cms/normalize";

/*
 * A deliberately small Markdown subset for blog posts, rendered straight to React elements (never
 * raw HTML), so post content can't inject scripts:
 *   ## Heading  ### Subheading   - bullet   1. numbered   > quote   ---
 *   **bold**  *italic*  `code`  [link](https://…)   ![alt text](image) on its own line
 */

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string, key: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const k = `${key}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={k}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*].*\*$/.test(part)) return <em key={k}>{part.slice(1, -1)}</em>;
    if (/^`[^`]+`$/.test(part))
      return (
        <code key={k} className="rounded bg-sand/60 px-1.5 py-0.5 text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return link[1];
      const external = /^https?:/i.test(href);
      return (
        <a key={k} href={href} className="text-teak underline decoration-1 underline-offset-4 hover:text-ink" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

type Block =
  | { type: "h2" | "h3" | "p" | "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "img"; alt: string; src: string }
  | { type: "hr" };

function parse(md: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ type: "p", text: para.join(" ") });
    para = [];
  };
  for (const raw of md.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    let m: RegExpExecArray | null;
    if (!line) {
      flush();
      continue;
    }
    if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) {
      flush();
      blocks.push({ type: m[1].length === 3 ? "h3" : "h2", text: m[2] });
    } else if (/^(-{3,}|\*{3,})$/.test(line)) {
      flush();
      blocks.push({ type: "hr" });
    } else if ((m = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(line))) {
      flush();
      const src = safeImage(m[2]);
      if (src) blocks.push({ type: "img", alt: m[1], src });
    } else if ((m = /^[-*]\s+(.*)$/.exec(line)) || (m = /^\d+[.)]\s+(.*)$/.exec(line))) {
      flush();
      const type = /^\d/.test(line) ? "ol" : "ul";
      const last = blocks[blocks.length - 1];
      if (last && last.type === type) last.items.push(m[1]);
      else blocks.push({ type, items: [m[1]] });
    } else if ((m = /^>\s?(.*)$/.exec(line))) {
      flush();
      const last = blocks[blocks.length - 1];
      if (last && last.type === "quote") last.text += ` ${m[1]}`;
      else blocks.push({ type: "quote", text: m[1] });
    } else {
      para.push(line);
    }
  }
  flush();
  return blocks;
}

export function Markdown({ source }: { source: string }) {
  return (
    <>
      {parse(source).map((b, i) => {
        const k = `b${i}`;
        switch (b.type) {
          case "h2":
            return (
              <h2 key={k} className="mt-16 font-serif text-[clamp(1.9rem,3vw,2.6rem)] leading-tight first:mt-0">
                {inline(b.text, k)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={k} className="mt-12 font-serif text-2xl leading-tight">
                {inline(b.text, k)}
              </h3>
            );
          case "quote":
            return (
              <blockquote key={k} className="my-10 border-l-2 border-brass pl-6 font-serif text-2xl leading-snug text-heading">
                {inline(b.text, k)}
              </blockquote>
            );
          case "ul":
          case "ol": {
            const Tag = b.type;
            return (
              <Tag key={k} className={`mt-6 space-y-2 pl-6 leading-relaxed text-ink/85 ${b.type === "ul" ? "list-disc" : "list-decimal"} marker:text-teak`}>
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it, `${k}-${j}`)}</li>
                ))}
              </Tag>
            );
          }
          case "img":
            return (
              <figure key={k} className="my-12">
                <Picture media={b.src} alt={b.alt} sizes="(min-width: 768px) 720px, 100vw" className="h-auto w-full rounded-sm" />
                {b.alt && <figcaption className="mt-3 text-sm text-stone">{b.alt}</figcaption>}
              </figure>
            );
          case "hr":
            return <hr key={k} className="my-12 border-line" />;
          default:
            return (
              <p key={k} className="mt-6 text-lg leading-relaxed text-ink/85">
                {inline(b.text, k)}
              </p>
            );
        }
      })}
    </>
  );
}

/** Rough reading time for the post header. */
export function readingMinutes(md: string) {
  return Math.max(1, Math.round(md.split(/\s+/).filter(Boolean).length / 220));
}
