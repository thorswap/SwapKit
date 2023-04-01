# @thorswap-lib/swapkit-core

## Install:

```bash
yarn add @thorswap-lib/swapkit-core
```

### SwapKitCore API:

| method                       | description                                         | requires package                                            |
| ---------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `addLiquidity`               | trigger LP add transaction                          | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) |
| `addSavings`                 | trigger tc add saver transaction                    | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) |
| `approveAssetForContract`    | trigger asset approve for contract transaction      |                                                             |
| `approveAsset`               | trigger asset approve transaction                   |                                                             |
| `bond`                       | trigger bond transaction                            | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) |
| `connectEVMWallet`           | connect to EVM wallet                               | [@thorswap-lib/web-extensions](../web-extensions/README.md) |
| `connectKeplr`               | connect to Keplr wallet                             | [@thorswap-lib/web-extensions](../web-extensions/README.md) |
| `connectKeystore`            | connect to Keystore wallet                          | [@thorswap-lib/keystore](../keystore/README.md)             |
| `connectLedger`              | connect to Ledger wallet                            | [@thorswap-lib/ledger](../ledger/README.md)                 |
| `connectWalletconnect`       | connect to WalletConnect wallet                     | [@thorswap-lib/walletConnect](../walletConnect/README.md)   |
| `connectXDEFI`               | connect to XDEFI wallet                             | [@thorswap-lib/web-extensions](../web-extensions/README.md) |
| `createLiquidity`            | trigger create LP pool transaction                  | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) |
| `deposit`                    | trigger TC router depositWithExpiry transaction     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) |
| `disconnectChain`            | disconnect wallet from swapKit                      |                                                             |
| `extend`                     | extend SwapKitCore with wallets & config variables  |                                                             |
| `getAddress`                 | get wallet address by chain                         |                                                             |
| `getExplorerAddressUrl`      | get explorer address url                            |                                                             |
| `getExplorerTxUrl`           | get explorer tx url                                 |                                                             |
| `getTransactionData`         | get wallet transaction data                         |                                                             |
| `getTransactions`            | get wallet transactions                             |                                                             |
| `getWalletByChain`           | fetch wallet data by chain                          |                                                             |
| `getWallet`                  | get wallet methods by chain                         |                                                             |
| `isAssetApprovedForContract` | check if asset is approved for contract             |                                                             |
| `isAssetApproved`            | check if asset is approved on tc router             |                                                             |
| `leave`                      | trigger leave transaction                           | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) |
| `registerThorname`           | trigger register thorname transaction               | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) |
| `swap`                       | trigger swap transaction on given route & quoteMode |                                                             |
| `transfer`                   | trigger wallet transfer/send                        | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) |
| `unbond`                     | trigger unbond transaction                          | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) |
| `upgrade`                    | trigger upgrade transaction                         | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) |
| `validateAddress`            | validate address per chain restrictions             |                                                             |
| `withdrawSavings`            | trigger tc withdraw saver transaction               | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) |
| `withdraw`                   | trigger LP withdraw transaction                     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos/README.md) |

### SwapKitCore class properties:

| property | description |
| -------- | ----------- |
| `connectedChains` | connected chains data after usage of `connectX` method (address, empty balance, walletType) |
| `connectedWallets` | connected wallets method after usage of `connectX` method [check available wallets](../../README.md#packages) |
