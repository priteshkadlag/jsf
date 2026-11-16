import type { BlogPost } from "./types";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-11-11" → "11 November 2026" (fixed format, so server and client always agree). */
export function formatDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1] ?? ""} ${m[1]}`;
}

/** Published posts, newest first. */
export function publishedPosts(posts: BlogPost[]) {
  return posts.filter((p) => p.published).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}
