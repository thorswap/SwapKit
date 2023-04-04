# @thorswap-lib/ledger

## Install:

```bash
yarn add @thorswap-lib/ledger
```

To use the ledger you need to [extend core](packages/swapkit-core#swapkitcore-api) with `ledgerWallet` and install the corresponding package for the chain you want to use.

```ts
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { ledgerWallet } from '@thorswap-lib/ledger';

const client = new SwapKitCore();

client.extend({
  wallets: [ledgerWallet],
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
| BSC              | ⏳     | [@thorswap-lib/toolbox-evm](../toolbox-evm/README.md)                            |
| COSMOS (ATOM)    | ✅     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md)                      |
| BNB              | ✅     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md)                      |
| THORCHAIN (RUNE) | ✅     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) cosmos-client@0.39.2 |

## Links:
