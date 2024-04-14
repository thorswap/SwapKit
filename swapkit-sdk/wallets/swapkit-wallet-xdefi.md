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

# @swapkit/wallet-xdefi

### **Installation**

```bash
<pnpm|bun> add @swapkit/wallet-xdefi
```

### Integration

Implementation with [core.md](../packages/core.md "mention")

```typescript
import { SwapKit } from '@swapkit/core'
import { xdefiWallet } from '@swapkit/wallet-xdefi'

const swapKitClient = SwapKit({
  wallets: { ...xdefiWallet },
});

await swapKitClient.connectXDEFI([Chain.Bitcoin], derivationPath)

const btcWallet = await swapKitClient.getWalletWithBalance(Chain.Bitcoin)
```

## Wallet Support

<table data-full-width="false"><thead><tr><th width="614" align="center">Supported Chains</th><th>Toolbox</th></tr></thead><tbody><tr><td align="center"><p>[Chain.Cosmos, Chain.THORChain, </p><p>Chain.Binance, Chain.Maya, Chain.Kujira]</p></td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a></td></tr><tr><td align="center">[Chain.Ethereum, Chain.Avalanche, Chain.BinanceSmartChain, Chain.Arbitrum, Chain.Optimism, Chain.Polygon]</td><td><a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a></td></tr><tr><td align="center">[Chain.Polkadot, Chain.Chainflip]</td><td><a href="../toolboxes/swapkit-toolbox-substrate.md">SUBSTRATE</a></td></tr><tr><td align="center">[Chain.Bitcoin, Chain.BitcoinCash, Chain.Dash, Chain.Dogecoin, Chain.Litecoin]</td><td><a href="../toolboxes/swapkit-toolbox-utxo.md">UTXO</a></td></tr></tbody></table>

