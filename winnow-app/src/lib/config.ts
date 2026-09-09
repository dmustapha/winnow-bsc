// File: src/lib/config.ts
export const CHAIN = (process.env.WINNOW_CHAIN ?? "testnet") as "mainnet" | "testnet";
export const ADDR = {
  mainnet: {
    id: 56,
    rpc: process.env.BSC_RPC ?? "https://bsc-dataseed.bnbchain.org",
    rpcFallback: "https://bsc-rpc.publicnode.com",
    identity: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
    reputation: "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63",
    keystore: "0x6572427ED530BadcF7375Cf9A4709D8d2b0E7E0a",
    venusLens: "0x595e9DDfEbd47B54b996c839Ef3Dd97db3ED19bA",
    aavePool: "0x6807dc923806fE8Fd134338EABCA509979a7e0cB",
    pcsNPM: "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364",
    pcsQuoter: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
    multicall3: "0xcA11bde05977b3631167028862bE2a173976CA11",
    explorer: "https://bscscan.com",
  },
  testnet: {
    id: 97,
    rpc: process.env.BSC_TESTNET_RPC ?? "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
    rpcFallback: "https://bsc-testnet-rpc.publicnode.com",
    identity: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
    reputation: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
    keystore: "0x6b8361C29d05D498b1a12B54A37310f94171E94A",
    venusLens: null, aavePool: null, pcsNPM: null, pcsQuoter: null,
    multicall3: "0xcA11bde05977b3631167028862bE2a173976CA11",
    explorer: "https://testnet.bscscan.com",
  },
} as const;
export const A = ADDR[CHAIN];               // write-side chain (attest/sessions/agents)
export const M = ADDR.mainnet;              // read-side market data is ALWAYS mainnet
export const SCAN_API = "https://api.8004scan.io/api/v1";
export const OPERATOR_PK = process.env.EVM_PRIVATE_KEY as `0x${string}`;
export const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? "";
export const DB_PATH = process.env.DB_PATH ?? "./data/winnow.db";
export const CATEGORIES = ["rebalancing", "grid-trading", "yield", "health-factor"] as const;
export type Category = (typeof CATEGORIES)[number];
