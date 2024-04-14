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

# @swapkit/toolbox-substrate

### **Installation**

```bash
<pnpm|bun> add @swapkit/toolbox-substrate
```

## Usage

```typescript
import { Chain, type SubstrateChain } from '@swapkit/helpers';
import { Network, getToolboxByChain, createKeyring } from '@swapkit/toolbox-substrate';

async function getToolbox<T extends SubstrateChain>(chain: T) {
  // Either pass your wallet signer or create one via `createKeyring` method
  const signer = signer || await createKeyring(phrase, Network[chain].prefix);
  const toolbox = await getToolboxByChain(chain, { signer });

  return await getToolboxByChain(chain)
}

const dotToolbox = await getToolbox(Chain.Polkadot)
const flipToolbox = await getToolbox(Chain.Chainflip)
```
