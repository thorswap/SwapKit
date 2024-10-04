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

# @swapkit/wallet-ledger

### **Installation**

```bash
<pnpm|bun> add @swapkit/wallet-ledger
```

### Integration

Implementation with [core.md](../packages/core.md "mention")

```typescript
import { SwapKit, getDerivaitionPathFor } from '@swapkit/core'
import { ledgerWallet } from '@swapkit/wallet-ledger'

const swapKitClient = SwapKit({
  wallets: { ...ledgerWallet },
});

// [84, 0, 1, 0, 0]
const derivationPath = getDerivationPathFor({ 
  chain: Chain.Bitcoin, index: 1, type: "nativeSegwitMiddleAccount"
});

await swapKitClient.connectLedger([Chain.Bitcoin], derivationPath)

const btcWallet = await swapKitClient.getWalletWithBalance(Chain.Bitcoin)
```

## Wallet Support

<table data-full-width="false"><thead><tr><th width="614" align="center">Supported Chains</th><th>Toolbox</th></tr></thead><tbody><tr><td align="center">[Chain.Binance, Chain.Cosmos, Chain.THORChain]</td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a></td></tr><tr><td align="center">[Chain.Arbitrum, Chain.Avalanche, Chain.BinanceSmartChain, Chain.Ethereum, Chain.Optimism, Chain.Polygon]</td><td><a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a></td></tr><tr><td align="center">[Chain.Bitcoin, Chain.BitcoinCash, Chain.Dash, Chain.Dogecoin]</td><td><a href="../toolboxes/swapkit-toolbox-utxo.md">UTXO</a></td></tr></tbody></table>
