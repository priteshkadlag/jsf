import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/*
 * Single-admin password login. Set ADMIN_PASSWORD in the environment (and optionally
 * ADMIN_SESSION_SECRET). The session is a signed, httpOnly cookie; changing the password
 * signs everyone out.
 */

export const SESSION_COOKIE = "jsf_admin";
const SESSION_DAYS = 7;

export const adminConfigured = () => (process.env.ADMIN_PASSWORD ?? "").length >= 8;

function secret() {
  const base = process.env.ADMIN_SESSION_SECRET || `jsf-admin:${process.env.ADMIN_PASSWORD ?? ""}`;
  return createHash("sha256").update(base).digest();
}

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string) {
  if (!adminConfigured()) return false;
  // Compare digests so the comparison takes the same time whatever the input length.
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(process.env.ADMIN_PASSWORD!).digest();
  return timingSafeEqual(a, b);
}

export function createSessionToken() {
  const expires = Date.now() + SESSION_DAYS * 864e5;
  return { token: `${expires}.${sign(String(expires))}`, expires: new Date(expires) };
}

export function verifySessionToken(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const [exp, mac] = token.split(".");
  if (!exp || !mac || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return safeEqual(mac, sign(exp));
}

export async function isAdmin() {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Throws unless the request carries a valid admin session. Call at the top of every admin action and route. */
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Not signed in.");
}

/* Very small brute-force brake: after 5 failures from one address, wait a minute. */
const failures = new Map<string, { count: number; until: number }>();
export function loginBlocked(ip: string) {
  const f = failures.get(ip);
  return !!f && f.count >= 5 && f.until > Date.now();
}
export function recordLoginFailure(ip: string) {
  const f = failures.get(ip);
  const count = f && f.until > Date.now() ? f.count + 1 : 1;
  failures.set(ip, { count, until: Date.now() + 60_000 });
}
export function clearLoginFailures(ip: string) {
  failures.delete(ip);
}
