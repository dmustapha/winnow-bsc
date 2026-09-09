import * as S from "../src/lib/agents/strategies";
const t0 = Date.now();
const hf = await S.healthFactorTick(process.env.WATCH_ADDR as `0x${string}`);
console.log("elapsed_ms:", Date.now()-t0);
console.log("detail:", hf.detail);
console.log("reasoning:", hf.reasoning);
