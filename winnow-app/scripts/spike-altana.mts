import { activateAgent, isSessionKeyValid } from "../src/lib/altana";
const r = await activateAgent("spike-test", 0, 2000000000000000n, 7200);
console.log("SPIKE sessionId", r.sessionId, "wallet", r.wallet.address, "grantTx", r.grantTx, "pubKey", r.session.publicKey.slice(0, 24));
console.log("isValidKey", await isSessionKeyValid(r.sessionId));
process.exit(0);
