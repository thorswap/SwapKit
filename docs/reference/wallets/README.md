---
description: Simple swapkit-core wallet extensions
---

# Wallets

{% hint style="info" %}
Each wallet need specific [Toolbox](../../) installed to work properly. Check _Integrations_ section under chosen wallet
{% endhint %}

* [Ledger](ledger.md)
* [Trezor](broken-reference)
* [TrustWallet](broken-reference)
* [XDEFI](broken-reference)
* [EVM Web Extensions](broken-reference) (MetaMask, Coinbase Wallet, Brave Wallet, TrustWallet Extension)
* [WalletConnect](broken-reference)
* [Keplr](broken-reference)

#### Example:

```typescript
import { Chain, DerivationPath } from '@thorswap-lib/types'
import { SwapKitCore } from '@thorswap-lib/swapkit-core'

const client = new SwapKitCore()

client.extend({
  config: {},
  wallets: [ledgerWallet, xdefiWallet],
});

await client.connectXDEFI([Chain.BTC, Chain.ETH, Chain.AVAX])
// OR
await client.connectLedger(Chain.ETH, DerivationPath.ETH)
```

### Custom Wallet Integration

// TODO:
