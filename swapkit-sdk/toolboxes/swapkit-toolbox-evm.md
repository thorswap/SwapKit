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

# @swapkit/toolbox-evm

### **Installation**

```bash
<pnpm|bun> add @swapkit/toolbox-evm
```

## Usage

```typescript
import { Chain, type EVMChain } from '@swapkit/helpers'
import { getToolboxByChain } from '@swapkit/toolbox-evm'

function getToolbox<T extends EVMChain>(chain: T) {
  const toolbox = getToolboxByChain(chain)
  const provider = new BrowserProvider(window.ethereum, "any")
  
  return toolbox({
    provider,
    signer: await provider.getSigner(),
    // For ETH
    ethplorerApiKey,
    // For rest of EVM chains
    covalentApiKey,
  })
}

const avaxToolbox = getToolbox(Chain.Avalanche)
const ethToolbox = getToolbox(Chain.Ethereum)
```
