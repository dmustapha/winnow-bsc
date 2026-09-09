// tests/unit/netguard.test.ts — INTERROGATE FIX (F-56/F-06): SSRF guard + expiry-aware session status.
// Pure helpers, no DB. assertPublicHttp must block private/reserved/localhost targets and pass public ones.
import assert from "node:assert";
import { assertPublicHttp, isPrivateIp } from "../../src/lib/netguard";
import { deriveSessionStatus, isSessionExpired } from "../../src/lib/session-status";

async function blocked(url: string) {
  try { await assertPublicHttp(url); return false; } catch (e: any) {
    assert.match(String(e.message), /blocked: private or invalid endpoint/, `wrong error for ${url}`);
    return true;
  }
}

async function main() {
  // 1) private / reserved / invalid targets must be blocked
  for (const url of [
    "http://127.0.0.1:8080/x", "http://localhost/x", "https://192.168.1.1/", "http://10.0.0.5/",
    "http://172.16.9.1/", "http://169.254.169.254/latest/meta-data", "http://0.0.0.0/",
    "http://[::1]/", "http://metadata.internal/", "ftp://example.com/", "not a url",
  ]) assert.ok(await blocked(url), `expected BLOCKED: ${url}`);

  // 2) public URL passes (real DNS lookup)
  await assertPublicHttp("https://testnet.bscscan.com/");

  // 3) raw IP classifier edges
  assert.ok(isPrivateIp("172.31.255.255") && isPrivateIp("::ffff:10.0.0.1") && isPrivateIp("fd00::1"));
  assert.ok(!isPrivateIp("8.8.8.8") && !isPrivateIp("2606:4700::1111"));

  // 4) expiry-aware status: a status='live' row past its expiry is expired everywhere
  const now = Date.now();
  const stale = { status: "live", expiry: Math.floor(now / 1000) - 60 };
  const fresh = { status: "live", expiry: Math.floor(now / 1000) + 3600 };
  const revoked = { status: "revoked", expiry: Math.floor(now / 1000) - 60 };
  assert.ok(isSessionExpired(stale, now) && !isSessionExpired(fresh, now) && !isSessionExpired(revoked, now));
  assert.equal(deriveSessionStatus(stale, now), "expired");
  assert.equal(deriveSessionStatus(fresh, now), "live");
  assert.equal(deriveSessionStatus(revoked, now), "revoked");

  console.log("PASS netguard.test: SSRF guard blocks private/invalid, allows public; session expiry derivation correct");
}
main().catch((e) => { console.error("FAIL netguard.test:", e.message); process.exit(1); });
