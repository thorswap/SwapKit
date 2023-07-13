---
description: Before making a swap, you need to request the best route from the SwapKit API.
---

# 3⃣ Request a Route

To request possible routes, follow the instructions below.

### Step 1: Build a QuoteParams object

The `QuoteParams` object describes a swap to/from any of the supported blockchains and contains all information necessary to determine the best routes. It is defined by the following interface:

```
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

```
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

### Step 3: Done, now you can execute the route

{% content-ref url="execute-a-route.md" %}
[execute-a-route.md](execute-a-route.md)
{% endcontent-ref %}
