// Winnow demo recorder — drives https://winnow-bsc.onrender.com per DEMO-SCRIPT.md (7 scenes).
// Captions + watermark + cursor dot are injected as DOM overlays so they bake into the capture.
// Safety: never touches session #5 or #6. At most 1 activate, 1 spend, 1 overcap, 1 revoke (own session only).
import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

const BASE = "https://winnow-bsc.onrender.com";
const RAW = path.resolve("raw");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = { scenes: [], fallbacks: [], mySessionId: null, startedAt: new Date().toISOString(), rerun: "scenes 4-7 after Render restart" };

async function api(p) {
  const r = await fetch(BASE + p);
  return r.json();
}

async function overlay(page) {
  await page.evaluate(() => {
    if (document.getElementById("__wm")) return;
    const wm = document.createElement("div");
    wm.id = "__wm";
    wm.textContent = "REAL BSC TESTNET · winnow-bsc.onrender.com";
    Object.assign(wm.style, {
      position: "fixed", top: "14px", right: "16px", zIndex: 99999,
      font: "600 15px ui-monospace, SFMono-Regular, monospace", color: "rgba(255,255,255,.85)",
      background: "rgba(0,0,0,.55)", padding: "6px 12px", borderRadius: "8px",
      border: "1px solid rgba(52,211,153,.35)", pointerEvents: "none", letterSpacing: ".02em",
    });
    document.body.appendChild(wm);
    const cap = document.createElement("div");
    cap.id = "__cap";
    Object.assign(cap.style, {
      position: "fixed", bottom: "36px", left: "50%", transform: "translateX(-50%)",
      zIndex: 99999, maxWidth: "72%", textAlign: "center",
      font: "600 26px -apple-system, 'Helvetica Neue', sans-serif", color: "#fff",
      background: "rgba(0,0,0,.68)", padding: "12px 22px", borderRadius: "12px",
      pointerEvents: "none", lineHeight: "1.35", display: "none",
    });
    document.body.appendChild(cap);
    const dot = document.createElement("div");
    dot.id = "__dot";
    Object.assign(dot.style, {
      position: "fixed", width: "22px", height: "22px", borderRadius: "50%",
      background: "rgba(52,211,153,.45)", border: "2px solid rgba(52,211,153,.9)",
      zIndex: 99998, pointerEvents: "none", left: "-50px", top: "-50px",
      transition: "left .06s linear, top .06s linear",
    });
    document.body.appendChild(dot);
    window.addEventListener("mousemove", (e) => {
      dot.style.left = e.clientX - 11 + "px";
      dot.style.top = e.clientY - 11 + "px";
    }, { passive: true });
  });
}

async function cap(page, text) {
  await page.evaluate((t) => {
    const c = document.getElementById("__cap");
    if (!c) return;
    if (!t) { c.style.display = "none"; return; }
    c.textContent = t;
    c.style.display = "block";
  }, text);
}

async function glide(page, x, y, steps = 18) {
  await page.mouse.move(x, y, { steps });
}

async function smoothScroll(page, dy, ms = 1200) {
  await page.evaluate(({ dy, ms }) => new Promise((res) => {
    const start = performance.now(), from = window.scrollY;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / ms);
      window.scrollTo(0, from + dy * (0.5 - Math.cos(Math.PI * k) / 2));
      k < 1 ? requestAnimationFrame(tick) : res();
    };
    requestAnimationFrame(tick);
  }), { dy, ms });
}

let browser;
async function scene(name, fn) {
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: RAW, size: { width: 1920, height: 1080 } },
  });
  const page = await ctx.newPage();
  const t0 = Date.now();
  let error = null;
  try {
    await fn(page);
  } catch (e) {
    error = String(e).slice(0, 400);
    console.error(`[${name}] ERROR:`, error);
  }
  const dur = (Date.now() - t0) / 1000;
  const vid = page.video();
  await ctx.close();
  const vpath = await vid.path();
  const dest = path.join(RAW, `${name}.webm`);
  fs.renameSync(vpath, dest);
  results.scenes.push({ name, file: dest, wallclock_s: +dur.toFixed(1), error });
  console.log(`[${name}] done ${dur.toFixed(1)}s -> ${dest}${error ? " (with error)" : ""}`);
  return { error };
}

async function gotoAndDress(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
  await overlay(page);
}

const AGENT = `${BASE}/agent/97/2288`;
const rowFor = (page, id) => page.locator(".card", { hasText: new RegExp(`session #${id}\\b`) }).first();

async function main() {
  browser = await chromium.launch({ channel: "chrome", headless: true });

  const pre = await api("/api/sessions");
  const preIds = new Set(pre.items.map((s) => s.id));
  console.log("pre session ids:", [...preIds].join(","));

  // ---------- Scene 4: Activate (own session) ----------
  let activated = false;
  for (let attempt = 1; attempt <= 2 && !activated; attempt++) {
    const { error } = await scene(attempt === 1 ? "scene4-activate" : "scene4-activate-retry", async (page) => {
      await gotoAndDress(page, AGENT);
      await cap(page, "Now hire it. No wallet popup, no seed phrase.");
      const btn = page.getByRole("button", { name: /Activate \(0\.005 BNB cap/ }).first();
      await btn.waitFor({ timeout: 15000 });
      const b = await btn.boundingBox();
      if (b) await glide(page, b.x + b.width / 2, b.y + b.height / 2, 18);
      await sleep(1200);
      await btn.click();
      await sleep(3000);
      await cap(page, "The Altana relay is granting a session key on chain, right now.");
      await sleep(8000);
      await cap(page, "A hard spend cap and an expiry are being written into the Keystore.");
      // wait for busy label to clear (button back to Activate) — up to 55s total
      await page.getByRole("button", { name: /Activate \(0\.005 BNB cap/ }).first()
        .waitFor({ timeout: 55000 });
      const alertEl = page.locator('[role="alert"]');
      if (await alertEl.count()) {
        const msg = await alertEl.first().textContent();
        throw new Error("activate error: " + msg);
      }
      const post = await api("/api/sessions");
      const fresh = post.items.filter((s) => !preIds.has(s.id) && s.status === "live").map((s) => s.id);
      if (!fresh.length) throw new Error("no new live session id found");
      results.mySessionId = Math.max(...fresh);
      activated = true;
      await cap(page, "There it is. Capped at five thousandths of a BNB, expiring in 24 hours.");
      const row = rowFor(page, results.mySessionId);
      await row.waitFor({ timeout: 10000 }).catch(() => {});
      const rb = await row.boundingBox().catch(() => null);
      if (rb) await glide(page, rb.x + 220, rb.y + 30, 20);
      await sleep(4500);
      await cap(page, "");
    });
    if (!activated && attempt === 1) {
      console.log("activate failed, waiting 70s for cooldown then one retry:", error);
      results.fallbacks.push("scene4: first activate attempt failed, retried after 70s");
      await sleep(70000);
    }
  }

  if (!activated) {
    // Fallback per script: show the standing session row, no clicks on it.
    results.fallbacks.push("scene4: activate unavailable, showed standing live session (no exercise)");
    await scene("scene4-fallback-standing", async (page) => {
      await gotoAndDress(page, AGENT);
      await cap(page, "A session is already standing, granted the same way. Capped, expiring, onchain.");
      await smoothScroll(page, 350, 1400);
      await sleep(6000);
      await cap(page, "");
    });
  }

  const my = results.mySessionId;

  // ---------- Scene 5: capped test spend + explorer ----------
  if (my) {
    await sleep(8000);
    await scene("scene5-spend", async (page) => {
      await gotoAndDress(page, AGENT);
      await smoothScroll(page, 320, 1200);
      const row = rowFor(page, my);
      await row.waitFor({ timeout: 15000 });
      await cap(page, "The agent spends through that session key. Watch.");
      const btn = row.getByRole("button", { name: "Send a capped test spend" });
      const b = await btn.boundingBox();
      if (b) await glide(page, b.x + b.width / 2, b.y + b.height / 2, 18);
      await sleep(1000);
      await btn.click();
      const card = page.locator('div:has-text("In-cap spend executed through the session key")').last();
      let ok = true;
      await page.locator('text=In-cap spend executed').first().waitFor({ timeout: 30000 }).catch(() => { ok = false; });
      if (ok) {
        await cap(page, "A real transaction, signed by the session key, inside the cap.");
        await sleep(3000);
        const txLink = page.locator('div.card a[href*="/tx/"]', { hasText: "tx" }).last();
        let href = null;
        try { href = await page.locator('.border-emerald-800\\/60 a[href*="/tx/"]').first().getAttribute("href"); } catch {}
        if (!href) { try { href = await txLink.getAttribute("href"); } catch {} }
        if (href) {
          results.spendTx = href;
          await page.goto(href, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
          await sleep(2500);
          const title = await page.title().catch(() => "");
          const body = await page.evaluate(() => document.body?.innerText?.slice(0, 400) || "").catch(() => "");
          if (/just a moment|attention required|verify you are human/i.test(title + body)) {
            results.fallbacks.push("scene5: BscScan challenge page, used /proof fallback");
            await page.goto(BASE + "/proof", { waitUntil: "domcontentloaded" });
          }
          await overlay(page);
          await cap(page, "That is it on BscScan. On chain, not a screenshot.");
          await smoothScroll(page, 200, 1200);
          await sleep(5000);
        }
      } else {
        results.fallbacks.push("scene5: spend failed or timed out, showed grant tx via /proof");
        await cap(page, "The grant itself is on chain, and the proof page lists nine more receipts.");
        await page.goto(BASE + "/proof", { waitUntil: "domcontentloaded" });
        await overlay(page);
        await cap(page, "The grant itself is on chain, and the proof page lists nine more receipts.");
        await smoothScroll(page, 300, 1500);
        await sleep(5000);
      }
      await cap(page, "");
    });

    // wait out any shared cooldowns before overcap
    await sleep(65000);

    // ---------- Scene 6: prove the leash (overcap revert) ----------
    await scene("scene6-leash", async (page) => {
      await gotoAndDress(page, AGENT);
      await smoothScroll(page, 320, 1200);
      const row = rowFor(page, my);
      await row.waitFor({ timeout: 15000 });
      await cap(page, "Now try to overspend it. Two times the cap.");
      const btn = row.getByRole("button", { name: "Prove the leash" });
      const b = await btn.boundingBox();
      if (b) await glide(page, b.x + b.width / 2, b.y + b.height / 2, 18);
      await sleep(1200);
      await btn.click();
      await cap(page, "The Keystore rejects it on chain. The cap is not a UI promise.");
      let ok = true;
      await page.locator('text=Over-cap spend REVERTED onchain').first().waitFor({ timeout: 30000 }).catch(() => { ok = false; });
      if (ok) {
        results.overcapReverted = true;
        await sleep(1500);
        await cap(page, "Reverted. The leash is real.");
        const amber = page.locator('.border-amber-800\\/60').first();
        const ab = await amber.boundingBox().catch(() => null);
        if (ab) await glide(page, ab.x + 200, ab.y + 20, 18);
        await sleep(4500);
      } else {
        results.fallbacks.push("scene6: overcap failed or timed out, narrated historical revert");
        await cap(page, "We proved this same revert on chain earlier. Hash on the proof page.");
        await sleep(5000);
      }
      await cap(page, "");
    });

    // revoke cooldown buffer
    await sleep(15000);

    // ---------- Scene 7: revoke own session + proof ----------
    await scene("scene7-revoke", async (page) => {
      await gotoAndDress(page, AGENT);
      await smoothScroll(page, 320, 1200);
      const row = rowFor(page, my);
      await row.waitFor({ timeout: 15000 });
      await cap(page, "Done with it? Fire the agent. One click, the key dies on chain.");
      const btn = row.getByRole("button", { name: `Fire (revoke #${my})` });
      const b = await btn.boundingBox();
      if (b) await glide(page, b.x + b.width / 2, b.y + b.height / 2, 18);
      await sleep(1200);
      await btn.click();
      let gone = false;
      try {
        await page.locator(`text=#${my} revoked`).first().waitFor({ timeout: 30000 });
        gone = true;
      } catch {
        // one on-camera retry per script (10s per-session cooldown)
        const alertEl = page.locator('[role="alert"]');
        if (await alertEl.count()) {
          await sleep(12000);
          await btn.click().catch(() => {});
          await page.locator(`text=#${my} revoked`).first().waitFor({ timeout: 30000 }).then(() => { gone = true; }).catch(() => {});
          results.fallbacks.push("scene7: revoke needed one retry after cooldown");
        }
      }
      results.revoked = gone;
      await cap(page, "Revoked. Grant, spend, cap, revoke. All of it verifiable.");
      await sleep(3000);
      await page.goto(BASE + "/proof", { waitUntil: "domcontentloaded" });
      await overlay(page);
      await cap(page, "Winnow. The trust layer BSC agents actually earn.");
      await smoothScroll(page, 400, 2000);
      await sleep(4000);
      await cap(page, "");
    });
  } else {
    // fallback scenes 5-7 without own session: proof page carries the lifecycle story
    results.fallbacks.push("scenes 5-7: no own session, /proof receipts carry the lifecycle");
    await scene("scene5to7-proof-fallback", async (page) => {
      await gotoAndDress(page, BASE + "/proof");
      await cap(page, "Grant, spend, cap, revoke. All of it on chain. Here are the receipts.");
      await smoothScroll(page, 500, 3000);
      await sleep(4000);
      await cap(page, "Winnow. The trust layer BSC agents actually earn.");
      await sleep(4000);
      await cap(page, "");
    });
  }

  // safety verification: session 5 and 6 untouched
  const post = await api("/api/sessions");
  const s5 = post.items.find((s) => s.id === 5), s6 = post.items.find((s) => s.id === 6);
  results.safety = { s5_status: s5?.status, s6_status: s6?.status };
  results.finishedAt = new Date().toISOString();
  fs.writeFileSync(".scenes-take2.json", JSON.stringify(results, null, 2));
  console.log("SAFETY session#5:", s5?.status, "session#6:", s6?.status);
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
