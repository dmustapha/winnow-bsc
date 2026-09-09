# Phase 5 — Frontend Critique (Winnow)

Reviewed: layout.tsx, page.tsx, c/[cat]/page.tsx, agent/[chain]/[id]/page.tsx, proof/page.tsx, AgentCard.tsx, GradeBadge.tsx, plus the API routes and probe.ts they depend on (transcript text renders in the UI).

Overall: the hero flow (land → category → agent → re-probe → activate → sessions → over-cap → revoke) is fully wired with no dead-ends. Every list has keys, every fetch handler catches rejections, loading/error/empty states exist on all three data pages, honesty copy is present-progressive throughout, and the feedback heuristic wording in the rendered transcript is descriptive ("insufficient independently-validated feedback"), not accusatory. Two demo-visible defects found.

---

## MUST-FIX (2)

### M1 — Long agent names/descriptions overflow the detail page layout
`src/app/agent/[chain]/[id]/page.tsx:83-84`
The `<h1>` (`{agent.name || ...}`) and description `<p>` sit in a `flex-1 min-w-0` container but have no `break-words` or `truncate`. Agent names come from the open ERC-8004 registry and can be arbitrary unbroken strings (e.g. a 200-char base64-ish name or a URL). Default `overflow-wrap: normal` means such a string will not wrap — it paints past the container edge, colliding with the GradeBadge and causing horizontal overflow on camera. AgentCard already handles this with `truncate` (src/components/AgentCard.tsx:8,11); the detail page does not.
**Fix:** add `break-words` (or `break-all`/`truncate`) to the h1 and the description p. One-line class change each.

### M2 — Session cap rendered as raw wei ("cap 5000000000000000 wei")
`src/app/agent/[chain]/[id]/page.tsx:138`
`cap {s.cap_wei} wei` prints the raw TEXT wei value from the sessions table — a 16-digit unformatted number in the middle of the hero flow's live-session card, immediately after Activate (which advertises "0.005 BNB cap"). This is exactly the "unformatted numbers" demo failure: judges see 5000000000000000 instead of 0.005 BNB.
**Fix:** `cap {(Number(s.cap_wei) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 6 })} BNB` (keep raw wei in a title attribute if evidence-fidelity matters).

---

## SHOULD-FIX (4)

### S1 — Headline "Most are shells." is a blanket characterization of third-party agents
`src/app/page.tsx:35`
The honesty rules require descriptive wording about third-party agents. "Most are shells" is an aggregate accusation-flavored claim, and it is not directly recomputable from a displayed counter (the counters show indexed/withEndpoints/probed/verifiedLive, from which the viewer must infer it). Lower risk than a per-agent accusation, but a judge reading the honesty rules against the headline could ding it.
**Suggested rewrite:** "{indexed} agents. Most never answer a probe." or "Only {withEndpoints} even declare an endpoint." — same punch, directly backed by the stats grid two lines below.

### S2 — Hardcoded "the 96% case" stat leaks into the public probe transcript
`src/lib/probe.ts:29`
`detail: "no declared endpoint (the 96% case)"` is embedded into every no-endpoint agent's transcript, which renders verbatim in the detail page's "Raw probe transcript (the evidence)" section (agent page:207). A hardcoded percentage in a document positioned as recomputable evidence violates the recomputability spirit — and it will silently go stale as the index grows. Change to `"no declared endpoint"` and let /proof carry the ratio via live counters.

### S3 — All navigation uses `<a>` instead of `next/link`
`src/app/layout.tsx:26-30`, `src/app/page.tsx:56,63`, agent page back-links (39,57)
Every hop in the recorded flow is a full-document reload against `force-dynamic` server pages — visible white flash + nav rebuild between land → category → agent on camera. `<Link>` gives client transitions and prefetch. Mechanical swap, but it touches every page; only do it if there's time to click through the full flow once after.

### S4 — Date parse `new Date(\`${grade.ran_at}Z\`)` is engine-dependent
`src/app/agent/[chain]/[id]/page.tsx:193`
`ran_at` is SQLite `datetime('now')` format `YYYY-MM-DD HH:MM:SS`; appending `Z` yields a non-ISO string (space, not `T`). V8/Chrome parses it; Safari/WebKit returns `Invalid Date` → `NaN > 86400000` is false → the ">24h old" staleness badge silently never shows there. Fix: `new Date(grade.ran_at.replace(" ", "T") + "Z")`. Record the demo in Chrome regardless.

---

## NOTE (6)

### N1 — Detail-page fetch has no abort/cleanup
`src/app/agent/[chain]/[id]/page.tsx:23-33` — `load()` in useEffect never aborts on unmount; `setD` after unmount is a no-op in React 18 so no crash, but an AbortController would be correct. The cooldown interval effect (17-21) does clean up properly.

### N2 — `a: any` prop on AgentCard, `d: any` state on detail page
`src/components/AgentCard.tsx:4`, agent page:10 — untyped API payloads; a shared `Agent`/`AgentDetail` type would catch field drift (e.g. the `agent_chain` vs `chain_id` split that already exists between sessions and agents).

### N3 — Actions/sessions queried by token_id only, ignoring chain
`src/app/api/agent/[chain]/[id]/route.ts:12-13` — `WHERE agent_token=?` without chain scoping; token 42 on BSC and testnet would share actions/sessions. Fine for the demo (single-chain references), wrong at scale.

### N4 — `s.expiry` unguarded
agent page:138 — `new Date(s.expiry * 1000)` prints "Invalid Date" if a session row ever lands without expiry. Activation path always sets it today.

### N5 — /proof sessions also show raw wei
`src/app/proof/page.tsx:59` — acceptable there (page is explicitly the raw-evidence surface), but format if M2's helper is extracted.

### N6 — No route-level error.tsx / not-found.tsx
Server pages (/, /c/[cat], /proof) rely on in-page try/catch fallbacks, which cover the API-fetch failure mode; an uncaught render error (e.g. db file lock) would show Next's default error screen. Low likelihood in a controlled demo.

---

## Verified-clean checklist
- Keys: all `.map()` calls keyed with stable ids (layout NAV href, stats label, cat slug, `chain:token`, session/attest/action ids). No index keys.
- Render-time state updates: none; all setState inside effects/handlers.
- Promise rejections: `load()` has `.catch(setFailed)`; `act()` wraps fetch+json in try/catch and resets `busy` on both paths; server pages wrap fetch in try/catch returning null → honest degraded states.
- Loading/error/empty states: landing degraded state (page.tsx:23-30), category null/empty states (c/[cat]:30-36), detail skeleton + failed + not-indexed states (agent page:35-59), proof empty states for attestations/sessions.
- Hero-flow dead-ends: none. Not-indexed, F/D grade, ungraded, non-reference (hiring gate copy), API-down all have designed states with a way forward. Client 20s reprobe cooldown matches server; activate 60s global cooldown surfaces as an inline error via `j.error` (visible, not silent).
- Honesty: "We're grading every one. N so far" (present-progressive), footer + /proof method note disclaim heuristic and auto-tagging, no "all graded/verified" claim anywhere including metadata.
- Accusatory wording: rendered fbDetail is descriptive ("insufficient independently-validated feedback"). "farm signature" (probe.ts:46) exists only in a code comment, never rendered.
- Raw JSON leaking: transcript `<pre>` and overcap error `<pre>` are intentional evidence surfaces, bounded with `overflow-auto max-h-64`.
- Hydration: interactive page is fully client-rendered; server pages emit no locale/time-dependent markup that differs client-side.
