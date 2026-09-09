// File: src/lib/chain.ts
import { createPublicClient, createWalletClient, http, parseAbi, fallback } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bsc, bscTestnet } from "viem/chains";
import { A, M, CHAIN, OPERATOR_PK } from "./config";
const writeChain = CHAIN === "mainnet" ? bsc : bscTestnet;
export const pub = createPublicClient({ chain: writeChain, transport: fallback([http(A.rpc), http(A.rpcFallback)]) });
export const pubMain = createPublicClient({ chain: bsc, transport: fallback([http(M.rpc), http(M.rpcFallback)]) });
let _operator: ReturnType<typeof privateKeyToAccount> | null = null;
export function getOperator() {
  if (!_operator) {
    if (!OPERATOR_PK) throw new Error("EVM_PRIVATE_KEY not set");
    _operator = privateKeyToAccount(OPERATOR_PK);
  }
  return _operator;
}
let _wallet: any = null;
export function getWallet() {
  if (!_wallet) _wallet = createWalletClient({ account: getOperator(), chain: writeChain, transport: http(A.rpc) });
  return _wallet;
}
export const REGISTRY_ABI = parseAbi([
  "function register(string agentURI) returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
]);
export const REPUTATION_ABI = parseAbi([
  "function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)",
  "function getSummary(uint256 agentId, address[] clientAddresses, string tag1, string tag2) view returns (uint64,int128,uint8)",
]);
export const VENUS_LENS_ABI = parseAbi([
  "function getAccountLimits(address account, address comptroller) view returns (address[] markets, uint256 liquidity, uint256 shortfall)",
]); // [UNVERIFIED] exact return struct — test at build vs docs-v4.venus.io; decision tree DT-7
export const AAVE_POOL_ABI = parseAbi([
  "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
]); // [VERIFIED] canonical Aave v3 signature
