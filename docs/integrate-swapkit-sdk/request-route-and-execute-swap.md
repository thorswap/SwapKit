---
description: Before making a swap, you need to request the best route from the SwapKit API.
---

# 3⃣ Request Route & Execute Swap

To request possible routes, follow the instructions below.

### Step 1: Build a QuoteParams object

The `QuoteParams` object describes a swap to/from any of the supported blockchains and contains all information necessary to determine the best routes. It is defined by the following interface:

```typescript
interface QuoteParams {
    affiliateBasisPoints?: string;
    buyAsset: string;
    recipientAddress?: string;
    sellAmount: string;
    sellAsset: string;
    senderAddress?: string;
    slippage: string;
}
```

{% hint style="info" %}
The `buyAsset` & `sellAsset` must be of the format `'chain.ticker'` For example, `BTC.BTC`.
{% endhint %}

{% hint style="info" %}
The recipientAddress **must** be a valid address for the `buyAsset` blockchain. Similarly the senderAddress must be a valid address for the `sellAsset`.
{% endhint %}

### Step 2. Call getQuote from SwapKitApi package

After creating the `quoteParams` object, you can pass it to the `getQuote` function of the `SwapKitApi` class.

```typescript
// or directly from @thorswap-lib/swapkit-api
import { SwapKitApi } from '@thorswap-lib/swapkit-sdk'

const quoteParams = {
    sellAsset: 'BTC.BTC',
    sellAmount: '1',
    buyAsset: 'ETH.ETH',
    senderAddress: '...', // A valid Ethereum address
    recipientAddress: '...', // A valid Bitcoin address
    slippage: '3',
};

const { routes } = await SwapKitApi.getQuote(quoteParams);
```

### Step 3: Choose fee option multiplier, route & execute swap

```typescript
import { FeeOption } from '@thorswap-lib/swapkit-sdk';

const bestRoute = routes.find(({ optimal }) => optimal)

const txHash = await skClient.swap({
    route: bestRoute,
    recipient: '...',
    feeOptionKey: FeeOption.Fast
    // FeeOption multiplies current base fee by:
    // Average => 1.2 
    // Fast => 1.5
    // Fastest => 2
});

// Returns explorer url like etherscan, viewblock, etc.
const explorerUrl = skClient.getExplorerTxUrl(inputChain, txHash)
```

The `skClient` used above assumes a wallet has been connected as described in [Set up the SDK](set-up-the-sdk.md).

{% hint style="warning" %}
Executing ERC20 Swaps with tokens on EVM chains need approval spending. Check if asset has been approved with built in methods.
{% endhint %}

```typescript
import { AmountWithBaseDenom, AssetEntity } from '@thorswap-lib/swapkit-sdk'

const isApproved = skClient.isAssetApprovedForContract(
  asset, // AssetEntity
  contractAddress: selectedRoute.contract
  amount, // AmountWithBaseDenom => amount to check that's possible to spent, default MaxInt256
)

const approveTx = skClient.approveAssetForContract(
  asset, // AssetEntity
  contractAddress: selectedRoute.contract
  amount, // AmountWithBaseDenom => amount approved to spent, default MaxInt256
)
```
