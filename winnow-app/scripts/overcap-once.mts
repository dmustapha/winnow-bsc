import { demonstrateOverCap, revoke, isSessionKeyValid, activateAgent, sessionExecute } from "../src/lib/altana";
// fresh full lifecycle with the corrected over-cap target (cap 0.002 BNB, 2h)
const r = await activateAgent("winnow-sentinel", 2288, 2000000000000000n, 7200);
console.log("GRANT sessionId", r.sessionId, "grantTx", r.grantTx);
console.log("isValidKey", await isSessionKeyValid(r.sessionId));
const ex = await sessionExecute(r.sessionId, r.agentWallet.address as `0x${string}`, 100000000000000n);
console.log("IN-CAP tx", ex.transactionHash, ex.status);
const oc = await demonstrateOverCap(r.sessionId);
console.log("OVERCAP", JSON.stringify(oc).slice(0, 260));
const rv = await revoke(r.sessionId);
console.log("REVOKE tx", rv, "isValidKey(after)", await isSessionKeyValid(r.sessionId));
