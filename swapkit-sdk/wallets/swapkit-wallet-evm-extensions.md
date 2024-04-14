---
description: >-
  Support for browser extensions like MetaMask, Coinbase Wallet, TrustWallet
  Web, Brave Wallet or OKX
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

# @swapkit/wallet-evm-extensions

### **Installation**

```bash
<pnpm|bun> add @swapkit/wallet-evm-extensions
```

### Integration

Implementation with [core.md](../packages/core.md "mention")

```typescript
import { SwapKit } from '@swapkit/core'
import { evmWallet } from '@swapkit/wallet-evm-extensions'

const swapKitClient = SwapKit({
  wallets: { ...evmWallet },
});
/* 
  WalletOption.METAMASK
  WalletOption.COINBASE_WEB
  WalletOption.TRUSTWALLET_WEB
  WalletOption.OKX_MOBILE
  WalletOption.BRAVE
*/
await swapKitClient.connectEVMWallet([Chain.Ethereum], WalletOption.MetaMask)

const wallet = await swapKitClient.getWalletWithBalance(Chain.Ethereum)
```

## Wallet Support

<table data-full-width="false"><thead><tr><th width="220">Wallet</th><th width="355" align="center">Supported Chains</th><th>Toolbox</th></tr></thead><tbody><tr><td>MetaMask Web</td><td align="center"><a href="../packages/swapkit-helpers.md#evmchain">EVMChain</a>[]</td><td><a href="../toolboxes/swapkit-toolbox-evm.md">EVM</a></td></tr><tr><td>Coinbase Web Wallet</td><td align="center"><a href="../packages/swapkit-helpers.md#evmchain">EVMChain</a>[]</td><td></td></tr><tr><td>TrustWallet Web</td><td align="center"><a href="../packages/swapkit-helpers.md#evmchain">EVMChain</a>[]</td><td></td></tr><tr><td>OKX Web</td><td align="center"><a href="../packages/swapkit-helpers.md#evmchain">EVMChain</a>[]</td><td></td></tr><tr><td>Brave Wallet</td><td align="center"><a href="../packages/swapkit-helpers.md#evmchain">EVMChain</a>[]</td><td></td></tr></tbody></table>

