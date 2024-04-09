---
description: >-
  SwapKit Client that wraps wallets and method in clear and easy to use
  interface.
---

# @swapkit/core

{% hint style="info" %}
#### Includes [core-1.md](core-1.md "mention") _&_ [core-2.md](core-2.md "mention")&#x20;
{% endhint %}

### **Installation**

```bash
<pnpm|bun> add @swapkit/core
```

### Usage

```typescript
import { Chain, SwapKit, SwapKitApi } from "@swapkit/core"
import { keystoreWallet } from "@swapkit/wallet-keystore"
import { ThorchainPlugin } from "@swapkit/thorchain"

const client = SwapKit({
  wallets: [keystoreWallet],
  plugins: [ThorchainPlugin]
})

const swap = async () => {
    await client.connectKeystore([Chain.Bitcoin, Chain.Ethereum], "phrases...")
    const quote = SwapKitApi.getSwapQuote({
        sellAsset: "ETH.ETH"
        sellAmount: 1,
        buyAsset: "BTC.BTC",
        senderAddress: client.getAddress(Chain.Ethereum),
        recipientAddress: client.getAddress(Chain.Bitcoin),
        slippage: "3",
    })

   const txHash = await client.swap({ ... })
    
   const txExplorerUrl = client.getExplorerUrl({ chain: Chain.Ethereum, txHash })
}
```
