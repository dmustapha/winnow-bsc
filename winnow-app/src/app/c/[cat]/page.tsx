// File: src/app/c/[cat]/page.tsx — category list, reference agents pinned first (F-005)
import AgentCard from "@/components/AgentCard";
export const dynamic = "force-dynamic";

const CAT_INFO: Record<string, { name: string; desc: string }> = {
  rebalancing: { name: "Rebalancing", desc: "Agents that manage LP ranges and reset positions." },
  "grid-trading": { name: "Grid Trading", desc: "Agents that run automated grid orders." },
  yield: { name: "Yield Optimisation", desc: "Agents that route funds to the highest APR." },
  "health-factor": { name: "Health Factor", desc: "Agents that protect positions against liquidation." },
};

async function agents(cat: string) {
  try {
    const r = await fetch(`http://localhost:${process.env.PORT ?? 3000}/api/agents?cat=${encodeURIComponent(cat)}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`agents ${r.status}`);
    return (await r.json()).items as any[];
  } catch {
    return null;
  }
}

export default async function Cat({ params }: { params: { cat: string } }) {
  const info = CAT_INFO[params.cat] ?? { name: params.cat.replace(/-/g, " "), desc: "" };
  const items = await agents(params.cat);
  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold">{info.name}</h1>
      {info.desc && <p className="text-zinc-400 text-sm mt-1">{info.desc}</p>}
      <div className="mt-6 grid gap-3">
        {items === null ? (
          <p className="text-amber-400 text-sm">Couldn&apos;t load agents right now — refresh in a moment.</p>
        ) : items.length ? (
          items.map((a: any) => <AgentCard key={`${a.chain_id}:${a.token_id}`} a={a} />)
        ) : (
          <p className="text-zinc-500">No agents categorized here yet — reference agents seed at launch, and real indexed agents are auto-categorized (labeled) as the index grows.</p>
        )}
      </div>
    </main>
  );
}
