# @thorswap-lib/trustwallet

## Install:

```bash
yarn add @thorswap-lib/trustwallet
```

To use the trustwallet you need to [extend core](packages/swapkit-core#swapkitcore-api) with `trustwalletWallet` and install the corresponding package for the chain you want to use.

```ts
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { trustwalletWallet } from '@thorswap-lib/trustwallet';

const client = new SwapKitCore();

client.extend({
  wallets: [trustwalletWallet],
});
```


### Supported chains:

| chain            | status | packages                                                                         |
| ---------------- | ------ | -------------------------------------------------------------------------------- |
| BTC              | ❌     | [@thorswap-lib/toolbox-utxo](../toolbox-utxo/README.md)                          |
| LTC              | ❌     | [@thorswap-lib/toolbox-utxo](../toolbox-utxo/README.md)                          |
| BCH              | ❌     | [@thorswap-lib/toolbox-utxo](../toolbox-utxo/README.md)                          |
| DOGE             | ❌     | [@thorswap-lib/toolbox-utxo](../toolbox-utxo/README.md)                          |
| ETH              | ✅     | [@thorswap-lib/toolbox-evm](../toolbox-evm/README.md)                            |
| AVAX             | ✅     | [@thorswap-lib/toolbox-evm](../toolbox-evm/README.md)                            |
| BSC              | ⏳     | [@thorswap-lib/toolbox-evm](../toolbox-evm/README.md)                            |
| COSMOS (ATOM)    | ❌     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md)                      |
| BNB              | ✅     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md)                      |
| THORCHAIN (RUNE) | ✅     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) cosmos-client@0.39.2 |

## Links:
