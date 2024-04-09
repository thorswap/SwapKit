---
description: Simple SwapKit API wrapper with typings helpers to keep fetches organized
---

# @swapkit/chainflip

### Installation

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @swapkit/api
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @swapkit/api
```
{% endtab %}

{% tab title="npm" %}
```bash
npm add @swapkit/api
```
{% endtab %}
{% endtabs %}

### Usage

Methods are wrapped in simple `SwapKitApi` object. Any types referenced in methods table are exported from `@swapkit/api` package as well

```typescript
import { SwapKitApi, type CachedPricesResponse } from '@swapkit/api'

const cachedPrices = await SwapKitApi.getCachedPrices({
  tokens: [{ identifier: 'BTC.BTC' }]
});

// Typings can be taken from directly from package
const btcPrice: CachedPricesResponse[number] = cachedPrices.find(
  ({ identifier }) => identifier === 'BTC.BTC'
);
```

### Methods

<table data-full-width="true"><thead><tr><th width="322.5">Method</th><th>Type References</th></tr></thead><tbody><tr><td><code>getCachedPrices</code></td><td><pre class="language-typescript"><code class="lang-typescript">({
  tokens: { identifier: string }[];
  metadata?: "true" | "false" | undefined;
  lookup?: "true" | "false" | undefined;
  sparkline?: "true" | "false" | undefined;
}) => Promise&#x3C;CachedPricesResponse[]>
</code></pre></td></tr><tr><td><code>getQuote</code></td><td><pre class="language-typescript"><code class="lang-typescript">({
    affiliateBasisPoints?: string | undefined;
    buyAsset: string;
    recipientAddress?: string | undefined;
    sellAmount: string;
    sellAsset: string;
    senderAddress?: string | undefined;
    slippage: string;
}) => Promise&#x3C;QuoteResponse>
</code></pre></td></tr><tr><td><code>getGasRates</code></td><td><pre class="language-typescript"><code class="lang-typescript">() => Promise&#x3C;GasRatesResponse>
</code></pre></td></tr><tr><td><code>getTxnDetails</code></td><td><pre class="language-typescript"><code class="lang-typescript"><strong>(txHash: string) => Promise&#x3C;TxnResponse>;
</strong></code></pre></td></tr><tr><td><code>getTokenlistProviders</code></td><td><pre class="language-typescript"><code class="lang-typescript">() => Promise&#x3C;TokenlistProvidersResponse>;
</code></pre></td></tr><tr><td><code>getTokenList</code></td><td><pre class="language-typescript"><code class="lang-typescript">(tokenlist: string) => Promise&#x3C;TODO>;
</code></pre></td></tr><tr><td><code>getThornameAddresses</code></td><td><pre class="language-typescript"><code class="lang-typescript">(address: string) => Promise&#x3C;ThornameResponse>;
</code></pre></td></tr><tr><td><code>getThornameRegisteredChains</code></td><td><pre class="language-typescript"><code class="lang-typescript">(address: string) => Promise&#x3C;string[]>;
</code></pre></td></tr><tr><td><code>getThornameRlookup</code></td><td><pre class="language-typescript"><code class="lang-typescript">(address: string, chain: string) => Promise&#x3C;unknown>;
</code></pre></td></tr></tbody></table>

