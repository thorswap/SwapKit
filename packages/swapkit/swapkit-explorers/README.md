# @thorswap-lib/swapkit-explorers

## Install:

```bash
pnpm add @thorswap-lib/swapkit-explorers
```

## API:

```typescript
import { Chain } from '@thorswap-lib/types';

import { getExplorerTxUrl, getExplorerAddressUrl } from '@thorswap-lib/swapkit-explorers';

// https://etherscan.io/tx/0x1234
const txUrl = getExplorerTxUrl({ chain: Chain.ETH, txId: '0x1234' });


// https://blockstream.info/address/bc1qwerty
const addressURL = getExplorerAddressUrl({ chain: Chain.BTC, address: 'bc1qwerty' });
```
