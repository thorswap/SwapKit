---
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

# @swapkit/toolbox-cosmos

### **Installation**

```bash
<pnpm|bun> add @swapkit/toolbox-cosmos
```

## Cosmos based

```typescript
import { GaiaToolbox, KujiraToolbox } from '@swapkit/toolbox-cosmos'

const gaiaToolbox = GaiaToolbox()
const kujiToolbox = KujiraToolbox()
```

## THORChain based

_Implements all methods from_ [#cosmos-based](swapkit-toolbox-cosmos.md#cosmos-based "mention") _toolboxes with addition to thorchain-specific features_

```typescript
import { ThorchainToolbox, MayaToolbox } from '@swapkit/toolbox-cosmos'

const thorchainToolbox = ThorchainToolbox({ stagenet: false })
const mayaToolbox = MayaToolbox({ stagenet: false })
```

## Types

### Fees

```typescript
type Fees = {
  average: SwapKitNumber;
  fast: SwapKitNumber;
  fastest: SwapKitNumber;
};
```

### TransferParams

```typescript
type TransferParams = {
  assetValue: AssetValue;
  fee?: StdFee;
  feeOptionKey?: FeeOption;
  from: string;
  memo?: string;
  privkey?: Uint8Array;
  recipient: string;
  signer?: OfflineDirectSigner;
};
```

