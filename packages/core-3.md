---
description: >-
  All-in-one SwapKit SDK package. It contains all wallets, core, api & types
  installed & exported.
---

# @swapkit/sdk

### **Installation**

```bash
<pnpm|bun> add @swapkit/sdk
```

### Usage

```typescript
import { createSwapKit, Chain, ConnectConfig, ApisType } from '@swapkit/sdk'

const config: {
  apis?: ApisType;
  excludedChains?: Chain[];
  config?: ConnectConfig;
  rpcUrls?: { [key in Chain]?: string }
} = {}

const skClient = createSwapKit(config)

await skClient.connectLedger(Chain.BTC)

const txHash = await skClient.swap(...)
```
