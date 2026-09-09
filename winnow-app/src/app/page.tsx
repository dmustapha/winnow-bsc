// File: src/app/page.tsx — landing: real counters from /api/stats (F-001; [CRITIQUE E-1] honest copy)
export const dynamic = "force-dynamic";

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
  const s = await stats();
  if (!s) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-balance">Winnow is starting up.</h1>
        <p className="mt-3 text-zinc-400">Counters come from live probes — refresh in a moment. We never show a number we can&apos;t recompute.</p>
      </main>
    );
  }
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      {/* [CRITIQUE E-1] present-progressive + live probed counter = honest (MUST-NOT-CLAIM: never imply full corpus graded) */}
      <h1 className="text-4xl font-bold text-balance leading-tight">
        {Number(s.indexed).toLocaleString()} agents. Most are shells.
        <br />
        We&apos;re grading every one. {Number(s.probed).toLocaleString()} so far.
      </h1>
      <p className="mt-3 text-zinc-400 max-w-2xl">
        Every grade is recomputed from live probes and onchain data. Hire any agent inside a spend-capped session you can revoke in one click.
      </p>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {([["Indexed", s.indexed], ["Declared endpoints", s.withEndpoints], ["Probed", s.probed], ["Verified live", s.verifiedLive]] as const).map(([l, v]) => (
          <div key={String(l)} className="card card-hover p-4">
            <div className="text-2xl font-[family-name:var(--font-geist-mono)]">{Number(v).toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">{l}</div>
          </div>
        ))}
      </div>
      {!s.indexComplete && (
        <p className="mt-3 text-xs text-amber-400/90">Index growing live from the ERC-8004 registry (rate-limited, honest counters).</p>
      )}
      <h2 className="mt-12 text-sm uppercase tracking-widest text-zinc-500">Hire by job</h2>
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        {CATS.map(([slug, name, desc]) => (
          <a key={slug} href={`/c/${slug}`} className="card card-hover p-6 block group">
            <div className="text-xl font-semibold group-hover:text-emerald-400 transition-colors">{name}</div>
            <div className="text-zinc-400 text-sm mt-1">{desc}</div>
          </a>
        ))}
      </div>
      <p className="mt-8 text-xs text-zinc-600">
        Counters recompute from the local index — derivation queries on <a href="/proof" className="text-zinc-500 hover:text-emerald-400 underline underline-offset-2">/proof</a>.
      </p>
    </main>
  );
}
