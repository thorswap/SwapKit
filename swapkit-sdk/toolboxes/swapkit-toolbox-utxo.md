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

# @swapkit/toolbox-utxo

### **Installation**

```bash
<pnpm|bun> add @swapkit/toolbox-utxo
```

## Usage

```typescript
import { Chain, type UTXOChain } from '@swapkit/helpers'
import { getToolboxByChain } from '@swapkit/toolbox-utxo'

function getToolbox<T extends UTXOChain>(chain: T) {
  const toolbox = getToolboxByChain(chain)
  
  return toolbox({ apiKey: blockchairApiKey, rpcUrl })
}

const btcToolbox = getToolbox(Chain.Bitcoin)
const dogeToolbox = getToolbox(Chain.Dogecoin)
```
