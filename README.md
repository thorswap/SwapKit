# SwapKit

🚧🚧🚧🚧🚧🚧
ALPHA version of SwapKit SDK. Under heavy development. Use at your own risk.
🚧🚧🚧🚧🚧🚧

## Usage

#### Install

```bash
yarn add @thorswap-lib/swapkit-core
```

#### Usage

Architecture of SwapKit SDK is pretty simple. It's based on the concept of toolboxes. Each toolbox is responsible for interacting with specific blockchain. For example, `@thorswap-lib/toolkit-evm` is responsible for interacting with ETH, AVAX, BSC, etc. Toolboxes are extending SwapKitCore instance with methods to interact with specific blockchain. SwapKitCore is responsible for managing wallets and providing unified interface for interacting with them. To extend SDK with wallet support you need to pass array of wallets to `extend` method. Wallets are responsible for interacting with specific wallet provider. After `extend` method is called, you can start connecting to wallets and interacting with them.


```typescript
import { Chain, FeeOption } from '@thorswap-lib/types';
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { keystoreWallet } from '@thorswap-lib/keystore';
import { ledgerWallet } from '@thorswap-lib/ledger';
import { walletconnectWallet } from '@thorswap-lib/walletconnect';
import { evmWallet, keplrWallet, xdefiWallet } from '@thorswap-lib/web-extensions';

let SKClient: SwapKitCore

const getSwapKitClient = () => {
  const client = SwapKitCore()

  core.extend({
    config: { covalentApiKey: '', ethplorerApiKey: '', utxoApiKey: '' },
    wallets: [
      keystoreWallet,
      ledgerWallet,
      walletconnectWallet,
      evmWallet,
      keplrWallet,
      xdefiWallet,
    ],
  });
  SKClient = core;

  return SKClient;
}

// m/44'/60'/2'/0/0
const llderivationPath = getDerivationPathFor({ chain: Chain.ETH, index: 2, type: 'ledgerLive' })
// m/44'/60'/0'/0/2
const derivationPath = getDerivationPathFor({ chain: Chain.ETH, index: 2 })

const connectLedger = (chain: Chain) => SKClient.connectKeystore(Chain.ETH)

const swap = () => {
  const quote = getResponse()
  SKClient.swap({
    route: quoteRoute, // quoteRoute is returned from [/quote API endpoint](https://dev-docs.thorswap.net/api/get-quote-for-a-swap-1)
    quoteMode: quoteRoute.meta.quoteMode,
    feeOptionKey: FeeOption.Fastest,
    recipient: SKClient.validateAddress({ chain: outputAssetChain, address }) ? address : ''
  })
}

```


### Development

This repo contains packages around SwapKit sdk and it's integrations with different blockchains.

#### Packages

| Package                      | Description                                                           | Chains                                          |
| ---------------------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| @thorswap-lib/swapkit-core   | Core package for SwapKit - exporting methods to interact with wallets | -                                               |
| @thorswap-lib/toolkit-evm    | Toolkit - exporting methods to integrate EVM chain                    | ETH, AVAX, BSC                                  |
| @thorswap-lib/toolkit-utxo   | Toolkit - exporting methods to integrate UTXO chain                   | BTC, LTC, DOGE, BCH                             |
| @thorswap-lib/toolkit-cosmos | Toolkit - exporting methods to integrate Cosmos chains                | THOR, ATOM, BNB                                 |
| @thorswap-lib/keystore       | Keystore wallet implementation                                        | All chains supported by toolboxes               |
| @thorswap-lib/ledger         | Ledger wallet implementation                                          | All chains supported by toolboxes               |
| @thorswap-lib/walletconnect  | WalletConnect implementation                                          | THOR, BNB, ETH                                  |
| @thorswap-lib/web-extensions | Web extensions (MetaMask, XDefi, Brave Wallet, TrustWallet Extension, Coinbase Wallet Extension) | [See more](./packages/web-extensions/README.md) |

#### Setup

```bash
yarn install; yarn build
```

## Contributing

#### New package

To create new package use `yarn generate` and pick one of options
It will setup the package with the necessary files for bundling and publishing.

#### Rules and conventions

Project comes with `@commitlint/config-lerna-scopes` so we can generate changelogs with changesets so commits should have scope in task when it's touching just one package i.e. "`chore(ledger): add ATOM integration`". [See more](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-lerna-scopes)

#### Release and publish

Packages are automatically published to npm when new PR is merged to `develop` and `main` branches.
To automate and handle process we use [changesets](https://github.com/changesets/changesets) and github action workflows.

To release new version of package you need to create PR with changes and add changeset file to your commit.

```bash
yarn changeset
```

After PR is merged to `develop` branch with changeset file, github action will create new PR with updated versions of packages and changelogs.

#### Testing

To run tests use `yarn test` command.
