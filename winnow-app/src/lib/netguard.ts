// File: src/lib/netguard.ts — INTERROGATE FIX (F-56): SSRF guard for prober outbound fetches.
// Onchain endpoint URLs are attacker-controlled and /api/reprobe is public — without this the prober
// doubles as a private-network port-scan oracle from the host. One helper: assertPublicHttp(url).
// Blocks non-http(s) schemes, localhost/*.internal hostnames, and private/reserved resolved IPs.
// Scoring flows unchanged: a blocked endpoint records as a failed check, it is never fetched.
import { lookup } from "node:dns/promises";

const BLOCKED = "blocked: private or invalid endpoint";

function isPrivateV4(ip: string): boolean {
  const o = ip.split(".").map(Number);
  if (o.length !== 4 || o.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true; // malformed = reject
  return (
    o[0] === 0 || o[0] === 10 || o[0] === 127 ||
    (o[0] === 172 && o[1] >= 16 && o[1] <= 31) ||
    (o[0] === 192 && o[1] === 168) ||
    (o[0] === 169 && o[1] === 254)
  );
}

function isPrivateV6(ip: string): boolean {
  const x = ip.toLowerCase();
  if (x === "::1" || x === "::") return true;
  if (/^f[cd]/.test(x)) return true; // fc00::/7 unique-local
  if (/^fe[89ab]/.test(x)) return true; // fe80::/10 link-local
  const mapped = x.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); // v4-mapped v6
  return mapped ? isPrivateV4(mapped[1]) : false;
}

export const isPrivateIp = (ip: string): boolean => (ip.includes(":") ? isPrivateV6(ip) : isPrivateV4(ip));

export async function assertPublicHttp(url: string): Promise<void> {
  let u: URL;
  try { u = new URL(url); } catch { throw new Error(BLOCKED); }
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error(BLOCKED);
  const host = u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".internal")) throw new Error(BLOCKED);
  const addrs = await lookup(host, { all: true }).catch(() => null);
  if (!addrs || addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) throw new Error(BLOCKED);
}
