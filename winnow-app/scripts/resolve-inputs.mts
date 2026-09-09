import { createPublicClient, http, parseAbi, parseAbiItem } from "viem";
import { bsc } from "viem/chains";
const pc = createPublicClient({ chain: bsc, transport: http("https://bsc-rpc.publicnode.com") });
const AAVE = "0x6807dc923806fE8Fd134338EABCA509979a7e0cB" as const;
const abi = parseAbi(["function getUserAccountData(address) view returns (uint256,uint256,uint256,uint256,uint256,uint256)"]);
const latest = await pc.getBlockNumber();
const seen = new Set<string>();
outer:
for (let i = 0; i < 10; i++) {
  const to = latest - BigInt(i) * 400n, from = to - 399n;
  const logs = await pc.getLogs({
    address: AAVE,
    event: parseAbiItem("event Borrow(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint8 interestRateMode, uint256 borrowRate, uint16 indexed referralCode)"),
    fromBlock: from, toBlock: to,
  });
  for (const l of logs.reverse()) {
    const u = l.args.onBehalfOf as string;
    if (seen.has(u)) continue; seen.add(u);
    const d = await pc.readContract({ address: AAVE, abi, functionName: "getUserAccountData", args: [u as any] });
    if (d[1] > 0n) { console.log("WATCH_ADDR", u, "totalDebtBase", d[1].toString(), "hf", (Number(d[5]) / 1e18).toFixed(3), "block", l.blockNumber); break outer; }
  }
}
