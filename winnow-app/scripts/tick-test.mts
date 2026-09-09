import * as S from "../src/lib/agents/strategies";
const hf = await S.healthFactorTick(process.env.WATCH_ADDR as `0x${string}`);
console.log("HF:", hf.detail, "\n  reasoning:", hf.reasoning);
const y = await S.yieldTick();
console.log("YIELD:", y.detail.slice(0, 120), "\n  reasoning:", y.reasoning);
const rb = await S.rebalanceTick(process.env.PCS_POOL as `0x${string}`);
console.log("REBAL:", rb.detail, "\n  reasoning:", rb.reasoning);
const g = await S.gridTick(process.env.PCS_POOL as `0x${string}`);
console.log("GRID:", g.detail, "\n  reasoning:", g.reasoning);
