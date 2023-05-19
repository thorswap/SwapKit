# @thorswap-lib/trezor

## Install:

```bash
pnpm add @thorswap-lib/trezor
```

To use the trezor you need to [extend core](packages/swapkit/swapkit-core#swapkitcore-api) with `trezorWallet` and install the corresponding package for the chain you want to use.

```ts
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { trezorWallet } from '@thorswap-lib/trezor';

const client = new SwapKitCore();

client.extend({
  wallets: [trezorWallet],
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
| COSMOS (ATOM)    | ❌     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md)                      |
| BNB              | ❌     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md)                      |
| THORCHAIN (RUNE) | ❌     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) cosmos-client@0.39.2 |

## Links:

[Playground & Docs](https://trezor.github.io/trezor-suite/connect-explorer/#/)
