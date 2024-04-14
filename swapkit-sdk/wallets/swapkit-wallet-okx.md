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

# @swapkit/wallet-okx

### **Installation**

```bash
<pnpm|bun> add @swapkit/wallet-okx
```

### Integration

Implementation with [core.md](../packages/core.md "mention")

```typescript
import { SwapKit } from '@swapkit/core'
import { okxWallet } from '@swapkit/wallet-okx'

const swapKitClient = SwapKit({
  wallets: { ...okxWallet },
});

await swapKitClient.connectOkx([Chain.Bitcoin, Chain.Ethereum, Chain.Cosmos])

const atomWallet = await swapKitClient.getWalletWithBalance(Chain.Cosmos)
```

## Wallet Support

<table data-full-width="false"><thead><tr><th width="614" align="center">Supported Chains</th><th>Toolbox</th></tr></thead><tbody><tr><td align="center">[Chain.Cosmos]</td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a></td></tr><tr><td align="center">[Chain.Arbitrum, Chain.Avalanche, Chain.BinanceSmartChain, Chain.Optimism, Chain.Polygon, Chain.Ethereum]</td><td><a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a></td></tr><tr><td align="center">[Chain.Bitcoin]</td><td><a href="../toolboxes/swapkit-toolbox-utxo.md">UTXO</a></td></tr></tbody></table>

