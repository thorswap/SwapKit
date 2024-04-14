---
layout:
  title:
    visible: true
  description:
    visible: false
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# @swapkit/wallet-coinbase

### **Installation**

```bash
<pnpm|bun> add @swapkit/wallet-coinbase
```

### Integration

Implementation with [core.md](../packages/core.md "mention")

```typescript
import { SwapKit } from '@swapkit/core'
import { coinbaseWallet } from '@swapkit/wallet-coinbase'

const swapKitClient = SwapKit({
  wallets: { ...coinbaseWallet },
});

await swapKitClient.connectCoinbaseWallet([Chain.Ethereum, Chain.Avalanche])

const avaxWallet = await swapKitClient.getWalletWithBalance(Chain.Avalanche)
const ethWallet = await swapKitClient.getWalletWithBalance(Chain.Ethereum)
```

## Wallet Support

<table data-full-width="false"><thead><tr><th width="614" align="center">Supported Chains</th><th>Toolbox</th></tr></thead><tbody><tr><td align="center">[Chain.Arbitrum, Chain.Avalanche, Chain.BinanceSmartChain, Chain.Optimism, Chain.Polygon, Chain.Ethereum]</td><td><a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a></td></tr></tbody></table>
