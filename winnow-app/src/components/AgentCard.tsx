// File: src/components/AgentCard.tsx
import GradeBadge from "./GradeBadge";

export default function AgentCard({ a }: { a: any }) {
  return (
    <a href={`/agent/${a.chain_id}/${a.token_id}`} className="card card-hover flex items-center gap-4 p-4 group">
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate group-hover:text-emerald-400 transition-colors">
          {a.name || `Agent #${a.token_id}`} {a.is_reference ? <span className="text-xs text-emerald-400 font-normal">· reference</span> : null}
        </div>
        <div className="text-sm text-zinc-500 truncate">{a.description || "no description"}</div>
      </div>
      <GradeBadge letter={a.letter} score={a.score} />
    </a>
  );
}
