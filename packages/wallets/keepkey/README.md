# @pioneer-platform/keepkey

## Install:

```bash
pnpm add @pioneer-platform/keepkey
```

To use KeepKey-sdk you need to have keepkey desktop installed [get started](https://keepkey.com/get-started)

```ts
import { SwapKitCore } from '@pioneer-platform/swapkit-core';
import { keepkeyWallet } from '@pioneer-platform/trezor';

const client = new SwapKitCore();

client.extend({
  wallets: [keepkeyWallet],
});
```

### Supported chains:

| chain            | status | package                      |
| ---------------- | ------ | ---------------------------- |
| BTC              | ✅     | [@pioneer-platform/toolbox-utxo](../toolbox-utxo/README.md)                          |
| LTC              | ✅     | [@pioneer-platform/toolbox-utxo](../toolbox-utxo/README.md)                          |
| BCH              | ✅     | [@pioneer-platform/toolbox-utxo](../toolbox-utxo/README.md)                          |
| DOGE             | ✅     | [@pioneer-platform/toolbox-utxo](../toolbox-utxo/README.md)                          |
| ETH              | ✅     | [@pioneer-platform/toolbox-evm](../toolbox-evm/README.md)                            |
| AVAX             | ✅     | [@pioneer-platform/toolbox-evm](../toolbox-evm/README.md)                            |
| BSC              | ✅     | [@pioneer-platform/toolbox-evm](../toolbox-evm/README.md)                            |
| COSMOS (ATOM)    | ✅     | [@pioneer-platform/toolbox-cosmos](../toolbox-cosmos/README.md)                      |
| BNB              | ✅     | [@pioneer-platform/toolbox-cosmos](../toolbox-cosmos/README.md)                      |
| THORCHAIN (RUNE) | ✅     | [@pioneer-platform/toolbox-cosmos](../toolbox-cosmos/README.md) cosmos-client@0.39.2 |

## Links:

[Playground & Docs](https://github.com/BitHighlander/keepkey-template)
