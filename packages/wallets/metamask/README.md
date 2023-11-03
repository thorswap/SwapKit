# @thorswap-lib/metamask snap

docs: https://shapeshift.com/snap

## Install:

```bash
pnpm add @thorswap-lib/metamask
```

```ts
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { metamaskWallet } from '@thorswap-lib/trezor';

const client = new SwapKitCore();

client.extend({
  wallets: [metamaskWallet],
});
```

### Supported chains:

| chain            | status | package                      |
| ---------------- | ------ | ---------------------------- |
| BTC              | ✅     | [@thorswap-lib/toolbox-utxo](../toolbox-utxo/README.md)                          |
| LTC              | ✅     | [@thorswap-lib/toolbox-utxo](../toolbox-utxo/README.md)                          |
| BCH              | ✅     | [@thorswap-lib/toolbox-utxo](../toolbox-utxo/README.md)                          |
| DOGE             | ✅     | [@thorswap-lib/toolbox-utxo](../toolbox-utxo/README.md)                          |
| ETH              | ✅     | [@thorswap-lib/toolbox-evm](../toolbox-evm/README.md)                            |
| AVAX             | ✅     | [@thorswap-lib/toolbox-evm](../toolbox-evm/README.md)                            |
| BSC              | ✅     | [@thorswap-lib/toolbox-evm](../toolbox-evm/README.md)                            |
| COSMOS (ATOM)    | ✅     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md)                      |
| BNB              | ✅     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md)                      |
| THORCHAIN (RUNE) | ✅     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) cosmos-client@0.39.2 |

