# @swapkit/wallet-trezor

## Install:

```bash
pnpm add @swapkit/wallet-trezor
```

To use the trezor you need to [extend core](packages/swapkit/swapkit-core#swapkitcore-api) with `trezorWallet` and install the corresponding package for the chain you want to use.

```ts
import { SwapKitCore } from '@swapkit/core';
import { trezorWallet } from '@swapkit/wallet-trezor';

const client = new SwapKitCore();

client.extend({
  wallets: [trezorWallet],
});
```

### Supported chains:

| chain            | status | package                      |
| ---------------- | ------ | ---------------------------- |
| BTC              | ✅     | [@swapkit/toolbox-utxo](../toolbox-utxo/README.md)                          |
| LTC              | ✅     | [@swapkit/toolbox-utxo](../toolbox-utxo/README.md)                          |
| BCH              | ✅     | [@swapkit/toolbox-utxo](../toolbox-utxo/README.md)                          |
| DOGE             | ✅     | [@swapkit/toolbox-utxo](../toolbox-utxo/README.md)                          |
| ETH              | ✅     | [@swapkit/toolbox-evm](../toolbox-evm/README.md)                            |
| AVAX             | ✅     | [@swapkit/toolbox-evm](../toolbox-evm/README.md)                            |
| BSC              | ✅     | [@swapkit/toolbox-evm](../toolbox-evm/README.md)                            |
| COSMOS (ATOM)    | ❌     | [@swapkit/toolbox-cosmos](../toolbox-cosmos/README.md)                      |
| BNB              | ❌     | [@swapkit/toolbox-cosmos](../toolbox-cosmos/README.md)                      |
| THORCHAIN (RUNE) | ❌     | [@swapkit/toolbox-cosmos](../toolbox-cosmos/README.md) |

## Links:

[Playground & Docs](https://trezor.github.io/trezor-suite/connect-explorer/#/)
