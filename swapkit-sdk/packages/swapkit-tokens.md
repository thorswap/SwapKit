---
description: Static token lists with addresses, identifiers, chains & decimals
---

# @swapkit/tokens

{% hint style="warning" %}
Usually this module is used only for `AssetValue.loadStaticAssets()` but can be useful for filtering or providing tailored list of tokens for some cases.
{% endhint %}

## **Getting started**

### **Installation**

```bash
<pnpm|bun> add @swapkit/tokens
```

### Usage

```typescript
import { ChainflipList, ThorchainList } from '@swapkit/tokens'

const TCAndChainflipSupportedTokens = [
  ...ThorchainList.tokens,
  ...ChainflipList.tokens,
]
```

### Available token lists

```typescript
import { 
    OneInchList,
    CoinGeckoList,
    MayaList,
    PancakeswapList,
    PancakeswapETHList,
    PangolinList,
    StargateARBList,
    SushiswapList,
    ThorchainList,
    TraderjoeList,
    UniswapList,
    WoofiList,
    ChainflipList,
} from "@swapkit/tokens";
```
