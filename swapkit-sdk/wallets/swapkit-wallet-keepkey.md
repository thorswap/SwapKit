# @swapkit/wallet-keepkey

### **Installation**

```bash
<pnpm|bun> add @swapkit/wallet-keepkey
```

### Integration

Implementation with [core.md](../packages/core.md "mention")

```typescript
import { SwapKit } from '@swapkit/core'
import { keepkeyWallet } from '@swapkit/wallet-keepkey'

const swapKitClient = SwapKit({
  wallets: { ...keepkeyWallet },
});

await swapKitClient.connectKeepkey([Chain.Ethereum, Chain.Avalanche])

const avaxWallet = await swapKitClient.getWalletWithBalance(Chain.Avalanche)
const ethWallet = await swapKitClient.getWalletWithBalance(Chain.Ethereum)
```

## Wallet Support

<table data-full-width="false"><thead><tr><th width="614" align="center">Supported Chains</th><th>Toolbox</th></tr></thead><tbody><tr><td align="center">[Chain.Binance, Chain.Cosmos,  Chain.THORChain, Chain.Maya]</td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a></td></tr><tr><td align="center">[Chain.Arbitrum, Chain.Avalanche, Chain.BinanceSmartChain, Chain.Ethereum, Chain.Optimism, Chain.Polygon]</td><td><a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a></td></tr><tr><td align="center">[Chain.Bitcoin, Chain.BitcoinCash, Chain.Dogecoin, Chain.Dash]</td><td><a href="../toolboxes/swapkit-toolbox-utxo.md">UTXO</a></td></tr></tbody></table>
