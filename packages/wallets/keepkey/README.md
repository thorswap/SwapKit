# @thorswap-lib/keepkey

## Install:

```bash
pnpm add @thorswap-lib/keepkey
```

To use KeepKey-sdk you need to have keepkey desktop installed [get started](https://keepkey.com/get-started)

```ts
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { keepkeyWallet } from '@thorswap-lib/trezor';

const client = new SwapKitCore();

client.extend({
  wallets: [keepkeyWallet],
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

## Links:

[Playground & Docs](https://github.com/BitHighlander/keepkey-template)
