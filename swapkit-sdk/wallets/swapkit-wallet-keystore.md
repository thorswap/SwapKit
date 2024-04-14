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

# @swapkit/wallet-keystore

### **Installation**

```bash
<pnpm|bun> add @swapkit/wallet-keystore
```

### Integration

Implementation with [core.md](../packages/core.md "mention")

```typescript
import { SwapKit } from '@swapkit/core'
import { keystoreWallet } from '@swapkit/wallet-keystore'

const swapKitClient = SwapKit({
  wallets: { ...keystoreyWallet },
});

const phrase = "elephant car hammer ..."
const index = 0
const supportedChains = [Chain.Arbitrum, Chain.Avalanche, Chain.Binance,
  Chain.BinanceSmartChain, Chain.Bitcoin, Chain.BitcoinCash, Chain.Chainflip,
  Chain.Cosmos, Chain.Dash, Chain.Dogecoin, Chain.Ethereum, Chain.Kujira,
  Chain.Litecoin, Chain.Maya, Chain.Optimism, Chain.Polkadot, Chain.Polygon,
  Chain.THORChain,
]

await swapKitClient.connectKeystore(supportedChains, phrases, index)

const btcWallet = await swapKitClient.getWalletWithBalance(Chain.Bitcoin)
const thorWallet = await swapKitClient.getWalletWithBalance(Chain.THORChain)
```

## Wallet Support

<table data-full-width="false"><thead><tr><th width="614" align="center">Supported Chains</th><th>Toolbox</th></tr></thead><tbody><tr><td align="center"><p>[Chain.Cosmos, Chain.THORChain, </p><p>Chain.Binance, Chain.Maya, Chain.Kujira]</p></td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a></td></tr><tr><td align="center">[Chain.Ethereum, Chain.Avalanche, Chain.BinanceSmartChain, Chain.Arbitrum, Chain.Optimism, Chain.Polygon]</td><td><a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a></td></tr><tr><td align="center">[Chain.Polkadot, Chain.Chainflip]</td><td><a href="../toolboxes/swapkit-toolbox-substrate.md">SUBSTRATE</a></td></tr><tr><td align="center">[Chain.Bitcoin, Chain.BitcoinCash, Chain.Dash, Chain.Dogecoin, Chain.Litecoin]</td><td><a href="../toolboxes/swapkit-toolbox-utxo.md">UTXO</a></td></tr></tbody></table>
