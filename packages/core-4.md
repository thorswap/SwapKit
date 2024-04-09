---
description: Static token lists with addresses, identifiers, chains & decimals
---

# @swapkit/tokens

{% hint style="warning" %}
Usually this module is used only for `AssetValue.loadStaticAssets()` but can be useful for filtering or providing tailored list of tokens for some cases.
{% endhint %}

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
