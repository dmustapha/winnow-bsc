// File: src/app/page.tsx — landing: real counters from /api/stats (F-001; [CRITIQUE E-1] honest copy)
import Counter from "@/components/Counter";
export const dynamic = "force-dynamic";

async function feed() {
  try {
    const r = await fetch(`http://localhost:${process.env.PORT ?? 3000}/api/feed`, { cache: "no-store" });
    if (!r.ok) throw new Error(`feed ${r.status}`);
    return await r.json();
  } catch { return null; }
}

async function stats() {
  try {
    const r = await fetch(`http://localhost:${process.env.PORT ?? 3000}/api/stats`, { cache: "no-store" });
    if (!r.ok) throw new Error(`stats ${r.status}`);
    return await r.json();
  } catch {
    return null; // render honest degraded state, never fake numbers
  }
}

const CATS = [
  ["rebalancing", "Rebalancing", "Manages LP ranges, resets positions"],
  ["grid-trading", "Grid Trading", "Automated grid orders"],
  ["yield", "Yield Optimisation", "Routes to highest APR"],
  ["health-factor", "Health Factor", "Protects against liquidation"],
] as const;

export default async function Home() {
  const [s, f] = await Promise.all([stats(), feed()]);
  if (!s) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-balance">Winnow is starting up.</h1>
        <p className="mt-3 text-zinc-400">Counters come from live probes. Refresh in a moment. We never show a number we can&apos;t recompute.</p>
      </main>
    );
  }
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      {/* [CRITIQUE E-1] present-progressive + live probed counter = honest (MUST-NOT-CLAIM: never imply full corpus graded) */}
      <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-bold text-balance leading-tight tracking-tight">
        <Counter value={Number(s.indexed)} /> agents. Most never answer a probe.
        <br />
        We&apos;re grading every one. <Counter value={Number(s.probed)} /> so far.
      </h1>
      <p className="mt-3 text-zinc-400 max-w-2xl">
        Every grade is recomputed from live probes and onchain data. Hire any agent inside a spend-capped session you can revoke in one click.
      </p>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {/* V-1: "Graded" not "Probed" — this counts grades incl. zero-network fastgrades */}
        {([["Indexed from ERC-8004", s.indexed], ["Graded (evidence-backed)", s.probed], ["Verified live", s.verifiedLive], ["Onchain attestations", s.attestations]] as const).map(([l, v]) => (
          <div key={String(l)} className="card card-hover p-4">
            <Counter value={Number(v)} className="text-2xl" />
            <div className="text-xs text-zinc-500 mt-1">{l}</div>
          </div>
        ))}
      </div>
      {/* W-1: honest LLM-degraded state — reference agents tick every 120s; >10min silence means reasoning is paused */}
      {(() => {
        const t = s.lastAgentAction ? new Date(String(s.lastAgentAction).replace(" ", "T") + "Z").getTime() : 0;
        return Date.now() - t > 10 * 60 * 1000 ? (
          <p className="mt-3 text-xs text-amber-400/90">
            Reference-agent reasoning is paused (LLM provider unavailable). Grades and probes stay live; agent actions resume when the provider does. We never show canned reasoning.
          </p>
        ) : null;
      })()}
      {!s.indexComplete && (
        <p className="mt-3 text-xs text-amber-400/90 flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          Index growing live from the ERC-8004 registry (rate-limited, honest counters).
        </p>
      )}
      <h2 className="mt-12 text-sm uppercase tracking-widest text-zinc-500">Hire by job</h2>
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        {CATS.map(([slug, name, desc]) => (
          <a key={slug} href={`/c/${slug}`} className="card card-hover p-6 block group">
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-xl font-semibold group-hover:text-emerald-400 transition-colors">{name}</div>
              <div className="tnum font-[family-name:var(--font-geist-mono)] text-xs text-zinc-500">
                {Number(s.gradedByCat?.[slug] ?? 0).toLocaleString()} graded
              </div>
            </div>
            <div className="text-zinc-400 text-sm mt-1">{desc}</div>
          </a>
        ))}
      </div>
      {f?.top?.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm uppercase tracking-widest text-zinc-500">Top graded right now</h2>
          <div className="mt-4 card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                <th className="p-3">Agent</th><th className="p-3">Category</th><th className="p-3 text-right">Grade</th><th className="p-3 text-right hidden sm:table-cell">Graded</th>
              </tr></thead>
              <tbody>
                {f.top.map((a: any) => (
                  <tr key={`${a.chain_id}:${a.token_id}`} className="border-b border-zinc-900 hover:bg-zinc-900/60">
                    <td className="p-3"><a className="hover:text-emerald-400 font-medium" href={`/agent/${a.chain_id}/${a.token_id}`}>{a.name}{a.is_reference ? <span className="ml-2 text-[10px] text-emerald-500 uppercase">reference</span> : null}</a>
                      <div className="text-xs text-zinc-600 truncate max-w-[38ch]">{a.description}</div></td>
                    <td className="p-3 text-zinc-400 capitalize">{(a.category ?? "uncategorized").replace("-", " ")}</td>
                    <td className="p-3 text-right font-[family-name:var(--font-geist-mono)] tnum"><span className="text-emerald-400 font-bold">{a.letter}</span> <span className="text-zinc-500">{a.score}</span></td>
                    <td className="p-3 text-right text-xs text-zinc-600 hidden sm:table-cell">{a.graded_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-12 grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500">Live activity</h2>
          <div className="mt-4 space-y-2">
            {(f?.recentGrades ?? []).map((g: any, i: number) => (
              <a key={i} href={`/agent/${g.chain_id}/${g.token_id}`} className="card card-hover p-3 flex items-center justify-between gap-3 block">
                <span className="text-sm truncate">Probed <span className="text-zinc-300">{g.name}</span></span>
                <span className="font-[family-name:var(--font-geist-mono)] text-xs tnum shrink-0"><span className="text-emerald-400 font-bold">{g.letter}</span> {g.score} · {String(g.graded_at).slice(11, 19)}Z</span>
              </a>
            ))}
            {(f?.attests ?? []).map((t: any, i: number) => (
              <a key={`t${i}`} target="_blank" rel="noreferrer" href={`${t.chain_id === 56 ? "https://bscscan.com" : "https://testnet.bscscan.com"}/tx/${t.tx_hash}`} className="card card-hover p-3 flex items-center justify-between gap-3 block">
                <span className="text-sm">Attested <span className="text-zinc-300">agent #{t.token_id}</span> onchain: {t.tag}={t.value}</span>
                <span className="text-xs text-emerald-500 font-[family-name:var(--font-geist-mono)] shrink-0">{String(t.tx_hash).slice(0, 10)}… ↗</span>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500">Reference agents thinking</h2>
          <div className="mt-4 space-y-2">
            {(f?.recentActions ?? []).length > 0 ? (f.recentActions.map((x: any, i: number) => (
              <div key={i} className="card p-3">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="text-emerald-500">{x.name ?? `agent #${x.agent_token}`}</span>
                  <span className="font-[family-name:var(--font-geist-mono)]">{x.kind} · {String(x.at).slice(11, 19)}Z</span>
                </div>
                <p className="mt-1 text-sm text-zinc-300 line-clamp-3">{x.reasoning}</p>
              </div>
            ))) : (
              <p className="card p-3 text-sm text-zinc-500">Agent reasoning resumes when the LLM provider does. We never show canned output.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm uppercase tracking-widest text-zinc-500">How a grade is made</h2>
        <div className="mt-4 grid sm:grid-cols-5 gap-3 text-sm">
          {([["1 · Index", "Mirror the full ERC-8004 registry, honestly labeled."],
             ["2 · Probe", "Real MCP initialize + A2A card fetch. Timeouts are results."],
             ["3 · Grade", "Liveness 40 + metadata 15 + feedback validity 30 + track record 15."],
             ["4 · Attest", "Verified liveness written back onchain for any app to read."],
             ["5 · Hire", "Spend-capped Altana session. Over-cap reverts. One-click revoke."]] as const).map(([t, d]) => (
            <div key={t} className="card p-4">
              <div className="font-semibold text-emerald-400 text-xs uppercase tracking-wide">{t}</div>
              <p className="mt-2 text-zinc-400 text-xs leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-xs text-zinc-600">
        Counters recompute from the local index. Derivation queries on <a href="/proof" className="text-zinc-500 hover:text-emerald-400 underline underline-offset-2">/proof</a>. Every grade links its raw probe transcript.
      </p>
    </main>
  );
}
