// GATE C3: real end-to-end session lifecycle for one reference agent (Winnow Sentinel, tokenId 2288)
import { activateAgent, sessionExecute, demonstrateOverCap, revoke, isSessionKeyValid } from "../src/lib/altana";
import * as S from "../src/lib/agents/strategies";

const r = await activateAgent("winnow-sentinel", 2288, 2000000000000000n, 7200); // 0.002 BNB cap, 2h
console.log("GRANT sessionId", r.sessionId, "grantTx", r.grantTx, "agentWallet", r.agentWallet.address);
console.log("isValidKey(after grant)", await isSessionKeyValid(r.sessionId));

// in-cap session execute: 0.0001 BNB to the agent's own key addr — proves the session ACTS within cap
const ex = await sessionExecute(r.sessionId, r.agentWallet.address as `0x${string}`, 100000000000000n);
console.log("IN-CAP execute tx", ex.transactionHash, "status", ex.status);

// agent strategy tick executes (real data + real reasoning), recorded against the agent
const tick = await S.healthFactorTick(process.env.WATCH_ADDR as `0x${string}`);
S.recordAction(2288, tick, ex.transactionHash);
console.log("TICK recorded:", tick.reasoning.slice(0, 100));

const oc = await demonstrateOverCap(r.sessionId);
console.log("OVERCAP", JSON.stringify(oc).slice(0, 200));

const rvTx = await revoke(r.sessionId);
console.log("REVOKE tx", rvTx);
console.log("isValidKey(after revoke)", await isSessionKeyValid(r.sessionId));
