# SwapKit

🚧🚧🚧🚧🚧🚧
ALPHA version of SwapKit SDK. Under heavy development. Use at your own risk.
🚧🚧🚧🚧🚧🚧

## Usage


### Full Integration Example

<details>
<summary>Full Installation (To be added)</summary>
</details>

### Partial Install Example

<details>
<summary>Partial Installation</summary>

If you want to install one part of SwapKit SDK, you can install it separate instances of wallets & toolboxes.
For example, if you want to use SwapKit SDK with EVM chains and Ledger wallet, you can install `@thorswap-lib/toolbox-evm`, `@thorswap-lib/ledger` and `@thorswap-lib/swapkit-core` packages.

<details>
<summary>pnpm</summary>

  ```bash
  pnpm add @thorswap-lib/toolbox-evm @thorswap-lib/ledger @thorswap-lib/swapkit-core
  ```
</details>
<details>
<summary>yarn</summary>

  ```bash
  yarn add @thorswap-lib/toolbox-evm @thorswap-lib/ledger @thorswap-lib/swapkit-core
  ```
</details>

<details>
<summary>npm</summary>

  ```bash
  npm install @thorswap-lib/toolbox-evm @thorswap-lib/ledger @thorswap-lib/swapkit-core
  ```
</details>


#### Usage

Architecture of SwapKit SDK is pretty simple. It's based on the concept of toolboxes. Each toolbox is responsible for interacting with specific blockchain. For example, `@thorswap-lib/toolbox-evm` is responsible for interacting with ETH, AVAX, BSC, etc. Toolboxes are extending SwapKitCore instance with methods to interact with specific blockchain. SwapKitCore is responsible for managing wallets and providing unified interface for interacting with them. To extend SDK with wallet support you need to pass array of wallets to `extend` method. Wallets are responsible for interacting with specific wallet provider. After `extend` method is called, you can start connecting to wallets and interacting with them.

```typescript
import { Chain, FeeOption } from '@thorswap-lib/types';
import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { evmWallet, keplrWallet, xdefiWallet } from '@thorswap-lib/web-extensions';
import { keystoreWallet } from '@thorswap-lib/keystore';
import { ledgerWallet } from '@thorswap-lib/ledger';
import { trezorWallet } from '@thorswap-lib/trezor';
import { trustwalletWallet } from '@thorswap-lib/trustwallet';
import { walletconnectWallet } from '@thorswap-lib/walletconnect';

const getSwapKitClient = () => {
  const client = new SwapKitCore()

  client.extend({
    config: {
      utxoApiKey: ''
      covalentApiKey: '',
      ethplorerApiKey: '',
      walletConnectProjectId: '',
    },
    wallets: [
      evmWallet, // MetaMask, BraveWallet, TrustWallet Web, Coinbase Wallet
      keplrWallet,
      keystoreWallet,
      ledgerWallet,
      trezorWallet,
      trustwalletWallet,
      walletconnectWallet,
      xdefiWallet,
    ],
  });

  return SKClient;
}

// [44, 60, 2, 0, 0]
const llderivationPath = getDerivationPathFor({ chain: Chain.ETH, index: 2, type: 'ledgerLive' })
// [44, 60, 0, 0, 2]
const derivationPath = getDerivationPathFor({ chain: Chain.ETH, index: 2 })

const connectLedger = (chain: Chain) => {
  await getSwapKitClient().connectLedger(Chain.ETH, derivationPath)

  // { address: '0x...', balance: [], walletType: 'LEDGER' }
  const walletData = await getSwapKitClient().getWalletByChain(Chain.ETH)
}

// quoteRoute is returned from `/quote` API endpoint
// https://dev-docs.thorswap.net/aggregation-api/examples/Swap#fetch-quote
const quoteParams = (sender: string, recipient: string) => {
    sellAsset: 'ETH.THOR-0xa5f2211b9b8170f694421f2046281775e8468044',
    buyAsset: 'BTC.BTC',
    sellAmount: '1000',
    senderAddress: sender,
    recipientAddress: recipient
}

const baseUrl = `https://api.thorswap.net/aggregator`;
const paramsStr = new URLSearchParams(quoteParams).toString();

const fetchQuote = (sender: string, recipient: string) => {
  const params = quoteParams(sender, recipient)
  const paramsStr = new URLSearchParams(params).toString();

  return fetch(`${baseUrl}/tokens/quote?${paramsStr}`).then(res => res.json())
}

const swap = () => {
  const senderAddress = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
  const recipient = 'bc1qcalsdh8v03f5xztc04gzqlkqhx2y07dakv7f5c'
  const { routes } = fetchQuote()
  // select best route from routes -> it has `optimal` flag set to true
  const route = routes[0]

  if (getSwapKitClient().validateAddress({ chain: Chain.BTC, address: recipient })) {
    const txHash = await SKClient.swap({
      route,
      // Fee option multiplier -> it will be used if wallet supports gas calculation params
      feeOptionKey: FeeOption.Fastest,
      recipient
    })

    // txHash: '0x...'
  }
}

```
</details>



## Packages
This repo contains packages around SwapKit sdk and its integrations with different blockchains.

| Package                                                             | Description                        | Chains                                          |
| ------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------- |
| [@thorswap-lib/swapkit-core](./packages/swapkit-core/README.md)     | Core package for SwapKit           | -                                               |
| [@thorswap-lib/toolbox-evm](./packages/toolbox-evm/README.md)       | Toolkit to integrate EVM chain     | ETH, AVAX, BSC                                  |
| [@thorswap-lib/toolbox-utxo](./packages/toolbox-utxo/README.md)     | Toolkit to integrate UTXO chain    | BTC, LTC, DOGE, BCH                             |
| [@thorswap-lib/toolbox-cosmos](./packages/toolbox-cosmos/README.md) | Toolkit to integrate Cosmos chains | THOR, ATOM, BNB                                 |
| [@thorswap-lib/keystore](./packages/keystore/README.md)             | Keystore implementation            | All chains supported by toolboxes               |
| [@thorswap-lib/ledger](./packages/ledger/README.md)                 | Ledger implementation              | All chains supported by toolboxes               |
| [@thorswap-lib/trezor](./packages/trezor/README.md)                 | Trezor implementation              | BTC, ETH, LTC, DOGE, BCH, AVAX                  |
| [@thorswap-lib/trustwallet](./packages/trustwallet/README.md)       | Trustwallet implementation         | THOR, BNB, ETH                                  |
| [@thorswap-lib/walletconnect](./packages/walletconnect/README.md)   | Walletconnect implementation       | ETH                                             |
| [@thorswap-lib/web-extensions](./packages/web-extensions/README.md) | Browser extensions                 | [See more](./packages/web-extensions/README.md) |




## Contributing

### Installation

```bash
yarn install; yarn build
```
#### Commit messages

Project comes with `@commitlint/config-lerna-scopes` so we can generate changelogs with changesets so commits should have scope in task when it's touching just one package i.e. "`chore(ledger): add ATOM integration`". [See more](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-lerna-scopes)


#### Branches

- `main` - production branch
- `develop` - development branch - all PRs should be merged here first

#### Testing

To run tests use `yarn test` command.

#### Pull requests

- PRs should be created from `develop` branch
- PRs should be reviewed by at least Code Owner (see CODEOWNERS file)
- PRs should have scope in commit message (see commit messages section)
- PRs should have tests if it's possible
- PRs should have changeset file if it's possible (see release section)

#### New package

To create new package use `yarn generate` and pick one of the options
It will setup the package with the necessary files for bundling and publishing.
</br>
New toolbox(TBA)
</br>
New wallet(TBA)


### Release and publish

Packages are automatically published to npm when new PR is merged to `main` & `develop` branches.
To automate and handle process we use [changesets](https://github.com/changesets/changesets) and github action workflows.

<b>Before running `yarn changeset` you have to pull `main` & `develop`</b>

To release new version of package you need to create PR with changes and add changeset file to your commit.

```bash
yarn changeset
```

After PR is merged to `develop` branch with changeset file, github action will create new PR with updated versions of packages and changelogs.

