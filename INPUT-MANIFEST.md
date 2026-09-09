# Input Manifest — Winnow
| ID | Category | Tier | Used By | How To Obtain | Required Before | Status |
|---|---|---|---|---|---|---|
| EVM_PRIVATE_KEY | credential | required | chain/altana/attestor | pipeline creds (present) | build | resolved |
| ANTHROPIC_API_KEY | credential | required | agent strategies | pipeline creds (present) | build | resolved |
| WINNOW_CHAIN | live-config | required | config | testnet now → mainnet after funding | build | resolved |
| WATCH_ADDR | live-config | deferred-until-build | health agent | bscscan Aave borrower @C3 (build-discovered) | build | unresolved |
| PCS_POOL | contract-addr | deferred-until-build | rebalancer | factory getPool(WBNB,USDT,500) @C3 (build-discovered) | build | unresolved |
| ATTESTOR2_PRIVATE_KEY | credential | optional | attestor | cast wallet new @C2 | build | unresolved |
| FLY_ACCOUNT | approval | deferred-until-deploy | hosting | flyctl auth | deploy | unresolved |
| MAINNET_BNB_FUNDING | approval | deferred-until-deploy | mainnet runbook | Dami, morning, ~0.01 BNB → 0xc211C942…12A5 | deploy | unresolved |
| BSC_RPC | live-config | optional | chain | default baked in | build | resolved |
| BSC_TESTNET_RPC | live-config | optional | chain | default baked in | build | resolved |
| DB_PATH | live-config | optional | db | default baked in | build | resolved |
