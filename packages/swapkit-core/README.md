# @thorswap-lib/swapkit-core

## Install:

```bash
yarn add @thorswap-lib/swapkit-core
```

### SwapKitCore API:

| method                       | description                                         | requires package                                            |
| ---------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `addLiquidity`               | trigger LP add transaction                          | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos) |
| `addSavings`                 | trigger tc add saver transaction                    | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos) |
| `approveAssetForContract`    | trigger asset approve for contract transaction      |                                                             |
| `approveAsset`               | trigger asset approve transaction                   |                                                             |
| `bond`                       | trigger bond transaction                            | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos) |
| `connectEVMWallet`           | connect to EVM wallet                               | [@thorswap-lib/web-extensions](../web-extensions) |
| `connectKeplr`               | connect to Keplr wallet                             | [@thorswap-lib/web-extensions](../web-extensions) |
| `connectKeystore`            | connect to Keystore wallet                          | [@thorswap-lib/keystore](../keystore)             |
| `connectLedger`              | connect to Ledger wallet                            | [@thorswap-lib/ledger](../ledger)                 |
| `connectTrustwallet`       | connect to Trustwallet wallet                     | [@thorswap-lib/trustwallet](../trustwallet)   |
| `connectXDEFI`               | connect to XDEFI wallet                             | [@thorswap-lib/web-extensions](../web-extensions) |
| `createLiquidity`            | trigger create LP pool transaction                  | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos) |
| `deposit`                    | trigger TC router depositWithExpiry transaction     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos) |
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
| `leave`                      | trigger leave transaction                           | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos) |
| `registerThorname`           | trigger register thorname transaction               | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos) |
| `swap`                       | trigger swap transaction on given route & quoteMode |                                                             |
| `transfer`                   | trigger wallet transfer/send                        | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos) |
| `unbond`                     | trigger unbond transaction                          | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos) |
| `upgrade`                    | trigger upgrade transaction                         | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos) |
| `validateAddress`            | validate address per chain restrictions             |                                                             |
| `withdrawSavings`            | trigger tc withdraw saver transaction               | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos) |
| `withdraw`                   | trigger LP withdraw transaction                     | [@thorswap-lib/toolbox-cosmos](../toolbox-cosmos) |

### SwapKitCore class properties:

| property | description |
| -------- | ----------- |
| `connectedChains` | connected chains data after usage of `connectX` method (address, empty balance, walletType) |
| `connectedWallets` | connected wallets method after usage of `connectX` method [check available wallets](../../#packages) |
