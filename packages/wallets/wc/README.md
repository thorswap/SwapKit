# @swapkit/wallet-wc

## Install:

```bash
pnpm add @swapkit/wallet-wc
```

To use the walletconnect you need to [extend core](packages/swapkit/swapkit-core#swapkitcore-api) with `walletconnectWallet` and install the corresponding package for the chain you want to use.

```ts
import { SwapKitCore } from '@swapkit/core';
import { walletconnectWallet } from '@swapkit/wallet-wc';

const client = new SwapKitCore();

client.extend({
  config: {
    walletConnectProjectId: '...',
  },
  wallets: [walletconnectWallet],
});
```


### Supported chains:

| chain            | status | packages                                                                         |
| ---------------- | ------ | -------------------------------------------------------------------------------- |
| BTC              | ❌     | [@swapkit/toolbox-utxo](../toolboxes/toolbox-utxo/README.md)                          |
| LTC              | ❌     | [@swapkit/toolbox-utxo](../toolboxes/toolbox-utxo/README.md)                          |
| BCH              | ❌     | [@swapkit/toolbox-utxo](../toolboxes/toolbox-utxo/README.md)                          |
| DOGE             | ❌     | [@swapkit/toolbox-utxo](../toolboxes/toolbox-utxo/README.md)                          |
| ETH              | ✅     | [@swapkit/toolbox-evm](../toolboxes/toolbox-evm/README.md)                            |
| AVAX             | ❌     | [@swapkit/toolbox-evm](../toolboxes/toolbox-evm/README.md)                            |
| BSC              | ❌     | [@swapkit/toolbox-evm](../toolboxes/toolbox-evm/README.md)                            |
| COSMOS (ATOM)    | ❌     | [@swapkit/toolbox-cosmos](../toolboxes/toolbox-cosmos/README.md)                      |
| BNB              | ❌     | [@swapkit/toolbox-cosmos](../toolboxes/toolbox-cosmos/README.md)                      |
| THORCHAIN (RUNE) | ❌     | [@swapkit/toolbox-cosmos](../toolboxes/toolbox-cosmos/README.md) |

## Links:
