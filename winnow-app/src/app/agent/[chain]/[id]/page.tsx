// File: src/app/agent/[chain]/[id]/page.tsx — detail (F-002/F-003/F-004; INVARIANT 4: never dead-ends)
"use client";
import { useCallback, useEffect, useState } from "react";
import GradeBadge from "@/components/GradeBadge";

const explorer = (chainId: number) => (chainId === 56 ? "https://bscscan.com" : "https://testnet.bscscan.com");
const chainLabel = (chainId: number) => (chainId === 56 ? "BSC" : "BSC testnet");

export default function AgentPage({ params }: { params: { chain: string; id: string } }) {
  const [d, setD] = useState<any>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [overcap, setOvercap] = useState<any>(null);
  const [exercise, setExercise] = useState<any>(null); // INTERROGATE FIX (F-45): live in-cap spend result
  const [activateStage, setActivateStage] = useState(""); // INTERROGATE FIX (F-44): staged grant progress label
  const [cooldownLeft, setCooldownLeft] = useState(0); // AC-2: visible reprobe cooldown countdown

  // INTERROGATE FIX (F-44): the grant is 2 onchain txs + relay round-trips (5-20s) — cycle the busy
  // label through honest stages so the wait reads as progress, not dead air. Timers clean up on completion.
  useEffect(() => {
    if (busy !== "activate") { setActivateStage(""); return; }
    setActivateStage("Creating session wallet…");
    const timers = ([[4000, "Registering session key onchain…"], [9000, "Granting spend-capped session…"], [15000, "Almost there…"]] as const)
      .map(([t, m]) => setTimeout(() => setActivateStage(m), t));
    return () => timers.forEach(clearTimeout);
  }, [busy]);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = setInterval(() => setCooldownLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldownLeft > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(
    () =>
      fetch(`/api/agent/${params.chain}/${params.id}`)
        .then((r) => r.json())
        .then(setD)
        .catch(() => setFailed(true)),
    [params.chain, params.id]
  );
  useEffect(() => {
    load();
  }, [load]);

  if (failed)
    return (
      <main className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-amber-400">Couldn&apos;t reach the API. Refresh in a moment.</p>
        <a className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block" href="/">← Back to the index</a>
      </main>
    );
  if (!d)
    return (
      <main className="max-w-4xl mx-auto px-6 py-12" aria-busy="true">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/2 rounded bg-zinc-900" />
          <div className="h-4 w-3/4 rounded bg-zinc-900" />
          <div className="h-24 rounded bg-zinc-900" />
        </div>
      </main>
    );
  if (d.error)
    return (
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-xl font-bold">Not indexed (yet).</h1>
        <p className="text-zinc-400 mt-2 text-sm">This agent hasn&apos;t reached our index yet. The crawl is live and growing.</p>
        <a className="text-emerald-400 hover:text-emerald-300 text-sm mt-3 inline-block" href="/">← Back to the index</a>
      </main>
    );

  const { agent, grade, attests, actions, sessions } = d;
  // INTERROGATE FIX (F-06): expiry-aware — a status='live' row past its expiry must never render as live
  const liveSessions = (sessions ?? []).filter((s: any) => s.status === "live" && s.expiry * 1000 > Date.now());

  const act = async (path: string, body: any, label: string, onJson?: (j: any) => void) => {
    setBusy(label);
    setErr("");
    try {
      const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (j.error) setErr(j.error);
      else onJson?.(j);
      await load();
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
    setBusy("");
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold break-words">{agent.name || `Agent #${agent.token_id}`}</h1>
          <p className="text-zinc-400 mt-1 break-words">{agent.description || "No description published onchain."}</p>
          <p className="text-xs text-zinc-600 mt-1 font-[family-name:var(--font-geist-mono)]">
            ERC-8004 #{agent.token_id} · {chainLabel(agent.chain_id)} (chain {agent.chain_id}) · owner {agent.owner ? `${agent.owner.slice(0, 10)}…` : "unknown"}
          </p>
        </div>
        <GradeBadge letter={grade?.letter} score={grade?.score} />
      </div>

      {/* INVARIANT 4: F/D is a designed state with an explanation, never a dead end */}
      {grade && (grade.letter === "F" || grade.letter === "D") && (
        <div className="mt-4 card p-4 border-red-900/60">
          <p className="text-sm text-red-300 font-semibold">Why the {grade.letter}?</p>
          <p className="text-sm text-zinc-400 mt-1">
            Our live probe found weak evidence this agent actually runs: liveness {grade.liveness}/40, metadata {grade.meta}/15, feedback validity {grade.feedback}/30, track record {grade.track}/15.
            The raw transcript below is the evidence. Re-probe any time to recompute.
          </p>
        </div>
      )}
      {!grade && (
        <div className="mt-4 card p-4">
          <p className="text-sm text-zinc-400">Not yet probed. Indexed honestly, grade pending. Hit &ldquo;Probe now&rdquo; to grade it live in front of you.</p>
        </div>
      )}

      {/* Grade breakdown is the hero: measured bars + the raw transcript as the evidence drawer */}
      {grade && (
        <section className="mt-6 card p-5">
          <h2 className="font-semibold">
            Grade breakdown <span className="text-xs text-zinc-500 font-normal tnum font-[family-name:var(--font-geist-mono)]">probed {grade.ran_at} UTC</span>
            {Date.now() - new Date(`${grade.ran_at}Z`).getTime() > 86400000 && (
              <span className="ml-2 text-xs text-amber-400 font-normal">grade &gt;24h old. Re-probe suggested</span>
            )}
          </h2>
          <div className="mt-4 grid gap-3">
            {([["Liveness", grade.liveness, 40], ["Metadata", grade.meta, 15], ["Feedback validity", grade.feedback, 30], ["Track record", grade.track, 15]] as const).map(([l, v, m]) => (
              <div key={String(l)}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-zinc-400">{l}</span>
                  <span className="tnum font-[family-name:var(--font-geist-mono)]">{v}/{m}</span>
                </div>
                <div className="meter mt-1.5" role="meter" aria-label={`${l}: ${v} of ${m}`} aria-valuenow={Number(v)} aria-valuemin={0} aria-valuemax={Number(m)}>
                  <div className="meter-fill" style={{ width: `${Math.max(0, Math.min(100, (Number(v) / Number(m)) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
          <details className="mt-4 group">
            <summary className="cursor-pointer text-emerald-400 hover:text-emerald-300 text-sm select-none">Raw probe transcript (the evidence)</summary>
            <pre className="mt-2 text-xs well p-3 overflow-auto max-h-64">{grade.transcript}</pre>
          </details>
        </section>
      )}

      <div className="mt-6 flex gap-3 flex-wrap items-center">
        <button
          onClick={() => act("/api/reprobe", { chain: +params.chain, id: +params.id }, "probe", () => setCooldownLeft(20))}
          disabled={!!busy || cooldownLeft > 0}
          className="px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {busy === "probe" ? "Probing live…" : cooldownLeft > 0 ? `Re-probe in ${cooldownLeft}s (cooldown)` : grade ? "Re-probe now" : "Probe now"}
        </button>
        {agent.is_reference ? (
          <button
            onClick={() => act("/api/activate", { agentName: agent.name, tokenId: +params.id, capBnb: 0.005, hours: 24 }, "activate")}
            disabled={!!busy}
            className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {busy === "activate" ? (activateStage || "Granting session…") : "Activate (0.005 BNB cap, 24h)"}
          </button>
        ) : (
          <span className="px-4 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500 text-sm">Hiring opens for verified-live agents</span>
        )}
      </div>
      {err && <p className="mt-3 text-red-400 text-sm" role="alert">{err}</p>}

      {liveSessions.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold">Live sessions <span className="text-xs text-zinc-500 font-normal">spend-capped by the Altana Keystore, onchain</span></h2>
          <div className="mt-2 grid gap-2">
            {liveSessions.map((s: any) => {
              const msLeft = Math.max(0, s.expiry * 1000 - Date.now());
              const total = Math.max(1, s.expiry * 1000 - new Date(`${s.created_at}Z`).getTime());
              const leftPct = Math.max(0, Math.min(100, (msLeft / total) * 100));
              return (
              <div key={s.id} className="card p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0 text-sm">
                  <span className="tnum font-[family-name:var(--font-geist-mono)] text-zinc-300">session #{s.id}</span>
                  <span className="text-zinc-500"> · spend cap <span className="tnum font-[family-name:var(--font-geist-mono)] text-zinc-300">{(Number(s.cap_wei) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 6 })} BNB</span> (enforced onchain) · expires {new Date(s.expiry * 1000).toLocaleString()}</span>
                  {s.grant_tx && s.grant_tx.startsWith("0x") && (
                    <>
                      {" · "}
                      <a className="text-emerald-400 hover:text-emerald-300" target="_blank" rel="noreferrer" href={`${explorer(s.agent_chain)}/tx/${s.grant_tx}`}>grant tx ↗</a>
                    </>
                  )}
                  <div className="meter mt-2 max-w-xs" role="meter" aria-label={`Session time remaining: ${Math.round(leftPct)} percent`} aria-valuenow={Math.round(leftPct)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="meter-fill" style={{ width: `${leftPct}%` }} />
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">time remaining on this grant · <span className="tnum font-[family-name:var(--font-geist-mono)]">{Math.floor(msLeft / 3600000)}h {Math.floor((msLeft % 3600000) / 60000)}m</span></p>
                </div>
                {/* INTERROGATE FIX (F-45): live in-cap spend through the session key — "see it transact", for real */}
                <button
                  onClick={() => act("/api/exercise", { sessionId: s.id }, `exercise-${s.id}`, (j) => setExercise({ ...j, chain: s.agent_chain }))}
                  disabled={!!busy}
                  className="px-3 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {busy === `exercise-${s.id}` ? "Sending capped spend…" : "Send a capped test spend"}
                </button>
                <button
                  onClick={() => act("/api/overcap-demo", { sessionId: s.id }, `overcap-${s.id}`, setOvercap)}
                  disabled={!!busy}
                  className="px-3 py-1.5 rounded-md bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {busy === `overcap-${s.id}` ? "Attempting over-cap spend…" : "Prove the leash"}
                </button>
                <button
                  onClick={() => act("/api/revoke", { sessionId: s.id }, `revoke-${s.id}`)}
                  disabled={!!busy}
                  className="px-3 py-1.5 rounded-md bg-red-800 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {busy === `revoke-${s.id}` ? "Revoking…" : `Fire (revoke #${s.id})`}
                </button>
              </div>
            );})}
          </div>
        </section>
      )}

      {exercise?.tx && (
        <div className="mt-4 card p-4 border-emerald-800/60">
          <p className="text-sm font-semibold text-emerald-300">In-cap spend executed through the session key.</p>
          <p className="text-xs text-zinc-400 mt-1">
            0.0001 BNB moved through the spend-capped session, signed by the session key, within the onchain cap.
            {String(exercise.tx).startsWith("0x") && (
              <>{" "}<a className="text-emerald-400 hover:text-emerald-300" target="_blank" rel="noreferrer" href={`${explorer(exercise.chain ?? 97)}/tx/${exercise.tx}`}>tx ↗</a></>
            )}
          </p>
        </div>
      )}

      {overcap && (
        <div className="mt-4 card p-4 border-amber-800/60">
          <p className="text-sm font-semibold text-amber-300">{overcap.reverted ? "Over-cap spend REVERTED onchain." : "Unexpected result"}</p>
          <p className="text-xs text-zinc-400 mt-1">
            We tried to spend 2× the session cap. The Altana Keystore rejected it. The cap is enforced onchain, not by this UI.
          </p>
          {overcap.error && (
            <pre className="mt-2 text-xs well p-3 overflow-auto text-red-300">{overcap.error}</pre>
          )}
        </div>
      )}

      {sessions?.some((s: any) => s.status === "revoked") && (
        <section className="mt-6">
          <h2 className="font-semibold text-sm text-zinc-400">Revoked sessions</h2>
          {sessions.filter((s: any) => s.status === "revoked").map((s: any) => (
            <p key={s.id} className="text-xs text-zinc-500 mt-1 font-[family-name:var(--font-geist-mono)]">
              #{s.id} revoked{s.revoke_tx && s.revoke_tx.startsWith("0x") ? <> · <a className="text-emerald-400 hover:text-emerald-300" target="_blank" rel="noreferrer" href={`${explorer(s.agent_chain)}/tx/${s.revoke_tx}`}>revoke tx ↗</a></> : null}
            </p>
          ))}
        </section>
      )}

      {attests?.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold">Onchain attestations</h2>
          {attests.map((t: any) => (
            <p key={t.id} className="text-sm font-[family-name:var(--font-geist-mono)] mt-1">
              <a className="text-emerald-400 hover:text-emerald-300" target="_blank" rel="noreferrer" href={`${explorer(t.chain_id)}/tx/${t.tx_hash}`}>
                {t.tag}={t.value} · {t.tx_hash.slice(0, 18)}… ↗
              </a>
              <span className="text-zinc-600 text-xs"> ({chainLabel(t.chain_id)})</span>
            </p>
          ))}
        </section>
      )}

      {actions?.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold">Recent actions</h2>
          {actions.map((x: any) => (
            <div key={x.id} className="mt-2 text-sm border-l-2 border-zinc-700 pl-3">
              <span className="font-[family-name:var(--font-geist-mono)] text-zinc-400 text-xs">{x.at} · {x.kind}</span>
              <p className="text-zinc-300">{x.reasoning}</p>
              {x.tx_hash && x.tx_hash.startsWith("0x") && (
                <a className="text-emerald-400 hover:text-emerald-300 text-xs" target="_blank" rel="noreferrer" href={`${explorer(agent.chain_id === 56 ? 56 : 97)}/tx/${x.tx_hash}`}>tx ↗</a>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
