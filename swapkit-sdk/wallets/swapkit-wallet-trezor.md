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

# @swapkit/wallet-trezor

### **Installation**

```bash
<pnpm|bun> add @swapkit/wallet-trezor
```

### Integration

Implementation with [core.md](../packages/core.md "mention")

```typescript
import { SwapKit, getDerivaitionPathFor } from '@swapkit/core'
import { trezorWallet } from '@swapkit/wallet-trezor'

const swapKitClient = SwapKit({
  wallets: { ...trezorWallet },
});

// [84, 0, 1, 0, 0]
const derivationPath = getDerivationPathFor({ 
  chain: Chain.Bitcoin, index: 1, type: "nativeSegwitMiddleAccount"
});

await swapKitClient.connectTrezor([Chain.Bitcoin], derivationPath)

const btcWallet = await swapKitClient.getWalletWithBalance(Chain.Bitcoin)
```

## Wallet Support

<table data-full-width="false"><thead><tr><th width="614" align="center">Supported Chains</th><th>Toolbox</th></tr></thead><tbody><tr><td align="center">[Chain.Arbitrum, Chain.Avalanche, Chain.BinanceSmartChain, Chain.Ethereum, Chain.Optimism, Chain.Polygon]</td><td><a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a></td></tr><tr><td align="center">[Chain.Bitcoin, Chain.BitcoinCash, Chain.Dash, Chain.Dogecoin, Chain.Litecoin]</td><td><a href="../toolboxes/swapkit-toolbox-utxo.md">UTXO</a></td></tr></tbody></table>

