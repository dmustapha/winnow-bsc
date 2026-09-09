import { activateAgent, isSessionKeyValid } from "../src/lib/altana";
const r = await activateAgent("winnow-sentinel", 2288, 5000000000000000n, 86400); // 0.005 BNB, 24h — LEAVE LIVE for demo
console.log("DEMO-LIVE sessionId", r.sessionId, "grantTx", r.grantTx, "isValidKey", await isSessionKeyValid(r.sessionId));
