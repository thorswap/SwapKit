# @thorswap-lib/walletconnect

## Install:

```bash
yarn add @thorswap-lib/walletconnect
```

To use the trustwallet you need to [extend core](packages/swapkit-core#swapkitcore-api) with `walletconnectWallet` and install the corresponding package for the chain you want to use.

```ts
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { walletconnectWallet } from '@thorswap-lib/walletconnect';

const client = new SwapKitCore();

client.extend({
  wallets: [walletconnectWallet],
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
