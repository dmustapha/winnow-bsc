// File: src/components/GradeBadge.tsx — INVARIANT 3: ungraded is a visible state, not a hidden row
export default function GradeBadge({ letter, score }: { letter?: string | null; score?: number | null }) {
  if (!letter) return <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400 whitespace-nowrap">not yet probed</span>;
  const color = ({ A: "bg-emerald-600", B: "bg-lime-600", C: "bg-amber-600", D: "bg-orange-700", F: "bg-red-700" } as Record<string, string>)[letter] ?? "bg-zinc-700";
  return <span className={`px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap shadow-sm ${color}`}>{letter} · {score}</span>;
}
