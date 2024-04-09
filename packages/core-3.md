---
description: >-
  All-in-one SwapKit SDK package. It contains all wallets, core, api & types
  installed & exported.
---

# @swapkit/sdk

### Installation

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @swapkit/sdk
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @swapkit/sdk
```
{% endtab %}

{% tab title="npm" %}
```bash
npm add @swapkit/sdk
```
{% endtab %}
{% endtabs %}

### Usage



```typescript
import { createSwapKit, Chain, ConnectConfig, ApisType } from '@swapkit/sdk'

const config: {
  apis?: ApisType;
  excludedChains?: Chain[];
  config?: ConnectConfig;
  rpcUrls?: { [key in Chain]?: string }
} = {}

const skClient = createSwapKit(config)

await skClient.connectLedger(Chain.BTC)

const txHash = await skClient.swap(...)
```
