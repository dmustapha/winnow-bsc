// File: src/lib/altana.ts
// Altana session layer — grant / revoke / over-cap demo (INVARIANT 5: caps enforced onchain).
// SDK 0.9.0 param truth (verified against dist/*.d.ts, DT-5):
//   client.grantSession({ wallet, signer, permissions, expiry, sessionSigner })  ← NOT `signerKey` (ARCH was [UNVERIFIED])
//   client.revokeSession({ wallet, signer, session: Session | publicKeyHex })
//   client.execute({ session, calls }) — session path; { wallet, signer, calls } — admin path
//   Session persistence: serializeSession() (JSON-safe, no key) + session pk in kv (capped demo custody, SECURITY.md)
// SDK is ESM-only with top-level await → loaded via dynamic import() so tsx (CJS) scripts and Next both work (DEV-301).
import type { SerializedSession, Session } from "@altananetwork/sdk";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { keccak256, parseAbi } from "viem";
import { CHAIN, OPERATOR_PK, A } from "./config";
import { db } from "./db";
import { pub } from "./chain";

type Sdk = typeof import("@altananetwork/sdk");
let _sdk: Sdk | null = null;
let _client: ReturnType<Sdk["createClient"]> | null = null;
let _op: ReturnType<Sdk["signerFromPrivateKey"]> | null = null;
async function sdk() {
  if (!_sdk) {
    _sdk = await import("@altananetwork/sdk");
    _client = _sdk.createClient({ chains: [CHAIN === "mainnet" ? _sdk.BNB : _sdk.BNB_TESTNET] });
    _op = _sdk.signerFromPrivateKey(OPERATOR_PK);
  }
  return { s: _sdk!, altana: _client!, operatorSigner: _op! };
}

// DT-5b honesty surface: null = real onchain session enforcement live; string = degraded-mode banner for UI.
export const SESSION_DEGRADED_BANNER: string | null = null;

export type AgentWallet = { address: string; pk: `0x${string}` };
export function loadOrCreateAgentWallet(name: string): AgentWallet {
  const k = `agent_wallet_${name}`;
  const row = db.prepare("SELECT v FROM kv WHERE k=?").get(k) as any;
  if (row) return JSON.parse(row.v);
  const pk = generatePrivateKey();
  const w = { address: privateKeyToAccount(pk).address, pk };
  db.prepare("INSERT INTO kv(k,v) VALUES(?,?)").run(k, JSON.stringify(w));
  return w; // kv on Fly volume; acceptable custody for capped demo agents (SECURITY.md)
}

type StoredHandle = { walletAddress: `0x${string}`; stored: SerializedSession; sessionPk: `0x${string}`; grantTx?: string };

function loadHandle(sessionRowId: number): StoredHandle {
  const raw = db.prepare("SELECT v FROM kv WHERE k=?").get(`session_handle_${sessionRowId}`) as any;
  if (!raw) throw new Error("no stored session handle");
  return JSON.parse(raw.v);
}

// Activate = operator smart wallet + activation tx (registers admin key) + grantSession(cap, expiry) to the agent's own key.
export async function activateAgent(agentName: string, refTokenId: number, capWei: bigint, expiryS: number, allowTo?: `0x${string}`) {
  const { s, altana, operatorSigner } = await sdk();
  const aw = loadOrCreateAgentWallet(agentName);
  const wallet = await altana.createWallet({ signer: operatorSigner }); // EIP-7702: wallet addr = operator EOA
  await altana.execute({ wallet, signer: operatorSigner, calls: { to: wallet.address as `0x${string}`, value: 0n } }); // activation registers admin key
  const expiry = Math.floor(Date.now() / 1000) + expiryS;
  const grant = await altana.grantSession({
    wallet, signer: operatorSigner,
    sessionSigner: s.signerFromPrivateKey(aw.pk), // session key = the agent's own key
    permissions: {
      calls: allowTo ? [{ to: allowTo }] : undefined, // omit ⇒ all targets; spend cap still binds
      spend: [{ limit: capWei, period: "day" }],      // native BNB cap (no token field)
    },
    expiry,
  });
  // [CRITIQUE E-4] persist rowId + session handle ATOMICALLY at grant — revoke()/demonstrateOverCap() read kv session_handle_{id}
  const info = db.prepare("INSERT INTO sessions(agent_chain,agent_token,agent_wallet,session_key,cap_wei,expiry,grant_tx,status) VALUES(?,?,?,?,?,?,?,'live')")
    .run(A.id, refTokenId, wallet.address, aw.address, capWei.toString(), expiry, grant.transactionHash ?? "onchain");
  const sessionId = Number(info.lastInsertRowid);
  const handle: StoredHandle = { walletAddress: wallet.address as `0x${string}`, stored: s.serializeSession(grant), sessionPk: aw.pk, grantTx: grant.transactionHash };
  db.prepare("INSERT INTO kv(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(`session_handle_${sessionId}`, JSON.stringify(handle));
  return { wallet, session: grant, agentWallet: aw, sessionId, grantTx: grant.transactionHash };
}

export async function revoke(sessionRowId: number) {
  const { altana, operatorSigner } = await sdk();
  const row = db.prepare("SELECT * FROM sessions WHERE id=?").get(sessionRowId) as any;
  if (!row) throw new Error("no session");
  const h = loadHandle(sessionRowId);
  // REAL onchain revocation — SDK accepts the persisted publicKey directly.
  const res = await altana.revokeSession({ wallet: { address: h.walletAddress }, signer: operatorSigner, session: h.stored.publicKey });
  const tx = res.transactionHash ?? "onchain";
  db.prepare("UPDATE sessions SET status='revoked', revoke_tx=? WHERE id=?").run(tx, sessionRowId);
  return tx;
}

// Session-path execute for agent strategies (used by worker for real acts within cap).
export async function sessionExecute(sessionRowId: number, to: `0x${string}`, value: bigint, data?: `0x${string}`) {
  const { s, altana } = await sdk();
  const h = loadHandle(sessionRowId);
  const session: Session = s.deserializeSession(h.stored, s.signerFromPrivateKey(h.sessionPk));
  return altana.execute({ session, calls: { to, value, ...(data ? { data } : {}) } });
}

// Over-cap revert demo — INVARIANT 5: attempt an execute EXCEEDING the session spend cap; validator rejects; capture as proof.
export async function demonstrateOverCap(sessionRowId: number) {
  const { s, altana } = await sdk();
  const h = loadHandle(sessionRowId);
  const row = db.prepare("SELECT * FROM sessions WHERE id=?").get(sessionRowId) as any;
  const session: Session = s.deserializeSession(h.stored, s.signerFromPrivateKey(h.sessionPk));
  const overCap = BigInt(row.cap_wei) * 2n;
  try {
    await altana.execute({ session, calls: { to: row.agent_wallet as `0x${string}`, value: overCap } });
    throw new Error("INVARIANT-5 VIOLATION: over-cap execute did NOT revert");
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (msg.includes("VIOLATION")) throw e;
    db.prepare("INSERT INTO agent_actions(agent_token,kind,detail,reasoning) VALUES(?,?,?,?)")
      .run(row.agent_token, "overcap_revert", JSON.stringify({ attempted: overCap.toString(), cap: row.cap_wei }),
        `Over-cap attempt reverted onchain as designed: ${msg.slice(0, 160)}`);
    return { reverted: true, error: msg.slice(0, 200) };
  }
}

// Gate proof helper — KeyStore.isValidKey(wallet, keccak256(sessionPublicKey)) read straight off chain.
const KEYSTORE_ABI = parseAbi(["function isValidKey(address user, bytes32 keyId) view returns (bool)"]);
export async function isSessionKeyValid(sessionRowId: number): Promise<boolean> {
  const h = loadHandle(sessionRowId);
  return pub.readContract({
    address: A.keystore as `0x${string}`, abi: KEYSTORE_ABI, functionName: "isValidKey",
    args: [h.walletAddress, keccak256(h.stored.publicKey as `0x${string}`)],
  }) as Promise<boolean>;
}
