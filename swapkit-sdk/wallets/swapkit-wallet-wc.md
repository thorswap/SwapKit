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

# @swapkit/wallet-wc

### **Installation**

```bash
<pnpm|bun> add @swapkit/wallet-wc
```

### Integration

Implementation with [core.md](../packages/core.md "mention")

```typescript
import { SwapKit } from '@swapkit/core'
import { walletconnectWallet } from '@swapkit/wallet-wc'

const swapKitClient = SwapKit({
  wallets: { ...walletconnectWallet },
});

await swapKitClient.connectWalletconnect([Chain.Ethereum])

const btcWallet = await swapKitClient.getWalletWithBalance(Chain.Bitcoin)
```

## Wallet Support

<table data-full-width="false"><thead><tr><th width="614" align="center">Supported Chains</th><th>Toolbox</th></tr></thead><tbody><tr><td align="center">[Chain.THORChain, Chain.Maya, Chain.Cosmos, Chain.Kujira]</td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a></td></tr><tr><td align="center">[Chain.Arbitrum, Chain.Avalanche, Chain.BinanceSmartChain, Chain.Ethereum, Chain.Optimism, Chain.Polygon]</td><td><a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a></td></tr></tbody></table>

