# @swapkit/wallet-keplr

### **Installation**

```bash
<pnpm|bun> add @swapkit/wallet-keplr
```

### Integration

Implementation with [core.md](../packages/core.md "mention")

```typescript
import { SwapKit } from '@swapkit/core'
import { keplrWallet } from '@swapkit/wallet-keplr'

const swapKitClient = SwapKit({
  wallets: { ...keplrWallet },
});

await swapKitClient.connectKeplr([Chain.Cosmos])

const atomWallet = await swapKitClient.getWalletWithBalance(Chain.Cosmos)
```

## Wallet Support

<table data-full-width="false"><thead><tr><th width="614" align="center">Supported Chains</th><th>Toolbox</th></tr></thead><tbody><tr><td align="center">[Chain.Cosmos,  Chain.Kujira]</td><td><a href="../toolboxes/swapkit-toolbox-cosmos.md">COSMOS</a></td></tr></tbody></table>
