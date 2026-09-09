import { revoke } from "../src/lib/altana";
for (const id of process.argv.slice(2).map(Number)) {
  try { console.log("revoked", id, await revoke(id)); }
  catch (e: any) { console.log("revoke", id, "FAIL:", e?.message?.slice(0, 120)); }
}
