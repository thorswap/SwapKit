# @swapkit/wallet-xdefi

## Install

```bash
pnpm add @swapkit/wallet-xdefi
```

To use the browser extensions you need to [extend core](packages/swapkit/swapkit-core#swapkitcore-api) and install the corresponding package for the chain you want to use.

```ts
import { SwapKitCore } from '@swapkit/core';
import { xdefiWallet } from '@swapkit/wallet-xdefi';

const client = new SwapKitCore();

client.extend({
  wallets: [xdefiWallet],
});
```

| chain            | XDefi | package                                                                          |
| ---------------- | ----- | -------------------------------------------------------------------------------- |
| BTC              | ✅    | [@swapkit/toolbox-utxo](../toolboxes/toolbox-utxo/README.md)                          |
| LTC              | ✅    | [@swapkit/toolbox-utxo](../toolboxes/toolbox-utxo/README.md)                          |
| BCH              | ✅    | [@swapkit/toolbox-utxo](../toolboxes/toolbox-utxo/README.md)                          |
| DOGE             | ✅    | [@swapkit/toolbox-utxo](../toolboxes/toolbox-utxo/README.md)                          |
| ETH              | ✅    | [@swapkit/toolbox-evm](../toolboxes/toolbox-evm/README.md)                            |
| AVAX             | ✅    | [@swapkit/toolbox-evm](../toolboxes/toolbox-evm/README.md)                            |
| BSC              | ✅    | [@swapkit/toolbox-evm](../toolboxes/toolbox-evm/README.md)                            |
| COSMOS (ATOM)    | ✅    | [@swapkit/toolbox-cosmos](../toolboxes/toolbox-cosmos/README.md)                      |
| BNB              | ✅    | [@swapkit/toolbox-cosmos](../toolboxes/toolbox-cosmos/README.md)                      |
| THORCHAIN (RUNE) | ✅    | [@swapkit/toolbox-cosmos](../toolboxes/toolbox-cosmos/README.md) |

## Links
