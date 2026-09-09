// File: src/app/proof/page.tsx — INVARIANT 6: every headline number, recomputable
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";

export default function Proof() {
  const att = db.prepare("SELECT * FROM attestations ORDER BY id DESC LIMIT 50").all() as any[];
  const ses = db.prepare("SELECT * FROM sessions ORDER BY id DESC LIMIT 20").all() as any[];
  const stats = {
    indexed: (db.prepare("SELECT COUNT(*) c FROM agents").get() as any).c,
    probed: (db.prepare("SELECT COUNT(*) c FROM grades").get() as any).c,
    verifiedLive: (db.prepare("SELECT COUNT(*) c FROM probe_logs WHERE liveness>0").get() as any).c,
  };
  return (
    <main className="max-w-4xl mx-auto px-6 py-8 text-sm">
      <h1 className="text-2xl font-bold">Proof</h1>
      <p className="text-zinc-400 mt-1">
        Every headline number, recomputable. Derivations: <code className="text-emerald-400">scripts/verify-claims.ts</code> in the repo.
      </p>

      <h2 className="mt-6 font-semibold">Registries (canonical ERC-8004)</h2>
      <p className="font-[family-name:var(--font-geist-mono)] text-xs mt-1 text-zinc-400">
        BSC Identity 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 · Reputation 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63
      </p>

      <h2 className="mt-5 font-semibold">Counters</h2>
      <p className="font-[family-name:var(--font-geist-mono)] text-zinc-300 mt-1">
        indexed={stats.indexed} probed={stats.probed} verifiedLive={stats.verifiedLive}
      </p>
      <p className="text-xs text-zinc-500 mt-1">
        indexed = <code>SELECT COUNT(*) FROM agents</code> · probed = <code>SELECT COUNT(*) FROM grades</code> (each row FK-bound to a raw probe transcript) · verifiedLive = <code>SELECT COUNT(*) FROM probe_logs WHERE liveness&gt;0</code>
      </p>

      <h2 className="mt-5 font-semibold">Attestation txs</h2>
      {att.length ? (
        att.map((t) => (
          <p key={t.id} className="font-[family-name:var(--font-geist-mono)] text-xs mt-1">
            <span className="text-zinc-500">{t.attested_at}</span> #{t.token_id} {t.tag}={t.value}{" "}
            <a className="text-emerald-400 hover:text-emerald-300" target="_blank" rel="noreferrer" href={`${t.chain_id === 56 ? "https://bscscan.com" : "https://testnet.bscscan.com"}/tx/${t.tx_hash}`}>
              {t.tx_hash} ↗
            </a>{" "}
            <span className="text-zinc-600">({t.chain_id === 56 ? "BSC" : "BSC testnet"})</span>
          </p>
        ))
      ) : (
        <p className="text-zinc-500 text-xs mt-1">No attestations yet. They land as the attestor verifies live agents.</p>
      )}

      <h2 id="method" className="mt-5 font-semibold">Method note</h2>
      <ul className="text-xs text-zinc-400 mt-1 space-y-1 list-disc list-inside">
        <li><span className="text-zinc-300">Feedback validity</span> is a coordinated-feedback <em>heuristic</em> (clustered clients, repeated scores), not proven sybil classification.</li>
        <li><span className="text-zinc-300">Categories</span> on non-reference agents come from honest keyword auto-tagging of their published descriptions, labeled as auto, never hand-curated.</li>
        <li>Grades cover probed agents only ({stats.probed} so far, growing); we index everything but never claim the full corpus is probed.</li>
      </ul>

      <h2 className="mt-5 font-semibold">Sessions (Altana Keystore)</h2>
      {ses.length ? (
        ses.map((s) => (
          <p key={s.id} className="font-[family-name:var(--font-geist-mono)] text-xs mt-1 text-zinc-300">
            #{s.id} agent#{s.agent_token} wallet {s.agent_wallet?.slice(0, 12)}… cap {s.cap_wei} status {s.status}
          </p>
        ))
      ) : (
        <p className="text-zinc-500 text-xs mt-1">No sessions yet. Activate a reference agent to grant the first spend-capped session.</p>
      )}
    </main>
  );
}
