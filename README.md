# SwapKit

### _Integrate Blockchains easily_

## Usage

### Documentation

- [Getting Started](https://docs.thorswap.finance/swapkit-docs)
- [Installation](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/install-swapkit-sdk)
- [Setup](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/set-up-the-sdk)
- [Request Quote & Execute Swap](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/request-route-and-execute-swap)

- [Wallets](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/wallets)
- [Toolboxes](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/toolboxes)

## Packages

This repo contains packages around SwapKit sdk and its integrations with different blockchains.

| Package                                                                                                             | Description                                            |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [@swapkit/api](https://docs.thorswap.finance/swapkit-docs/references/swapkit-sdk-methods/core)                      | SwapKit API wrapper                                    |
| [@swapkit/core](https://docs.thorswap.finance/swapkit-docs/references/swapkit-sdk-methods/core-1)                   | Core package for SwapKit                               |
| [@swapkit/helpers](https://docs.thorswap.finance/swapkit-docs/references/swapkit-sdk-methods/core-2)                | Helpers for Assets & BigInt handle                     |
| [@swapkit/sdk](https://docs.thorswap.finance/swapkit-docs/references/swapkit-sdk-methods/core-3)                    | All-in-one package for SwapKit                         |
| [@swapkit/tokens](https://docs.thorswap.finance/swapkit-docs/references/swapkit-sdk-methods/core-4)                 | Static tokens lists with decimals & contract addresses |
| [@swapkit/types](https://docs.thorswap.finance/swapkit-docs/references/swapkit-sdk-methods/core-5)                  | Types & enums for SwapKit                              |
| [@swapkit/toolbox-cosmos](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/toolboxes/cosmos)                  | Integrate Cosmos chains                                |
| [@swapkit/toolbox-evm](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/toolboxes/evm)                        | Integrate EVM chain                                    |
| [@swapkit/toolbox-utxo](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/toolboxes/utxo)                      | Integrate UTXO chain                                   |
| [@swapkit/wallet-evm-extensions](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/wallets/evm-web-extensions) | EVM Browser Extensions                                 |
| [@swapkit/wallet-keplr](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/wallets/keplr)                       | Keplr Wallet                                           |
| [@swapkit/wallet-keystore](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/wallets/keystore)                 | Keystore Wallet                                        |
| [@swapkit/wallet-ledger](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/wallets/ledger)                     | Ledger Wallet                                          |
| [@swapkit/wallet-okx](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/wallets/okx)                  | OKX Wallet                                   |
| [@swapkit/wallet-trezor](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/wallets/trezor)                     | Trezor Wallet                                          |
| [@swapkit/wallet-wc](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/wallets/walletconnect)                  | Walletconnect Wallet                                   |
| [@swapkit/wallet-xdefi](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/wallets/xdefi)                       | XDEFI Wallet                                           |

## Contributing

#### Pre-requisites

1.

```bash
curl -fsSL https://bun.sh/install | bash
```

2.

```pre
Copy .env.example to .env and fill it with data
```

### Installation

```bash
bun bootstrap
```

#### Branches

- `main` - production branch
- `develop` - development branch - all PRs should be merged here first
- `nightly` - branch for nightly builds - can be used for testing purposes

#### Testing

To run tests use `bun test` command.

#### Pull requests

- PRs should be created from `develop` branch
- PRs should be reviewed by at least Code Owner (see CODEOWNERS file)
- PRs should have scope in commit message (see commit messages section)
- PRs should have tests if it's possible
- PRs should have changeset file if it's needed (see release section)

#### New package

To create new package use `bun generate` and pick one of the options
It will setup the package with the necessary files for bundling and publishing.

### Release and publish

Packages are automatically published to npm when new PR is merged to `main` & `develop` branches.
To automate and handle process we use [changesets](https://github.com/changesets/changesets) and github action workflows.

<b>Before running `bun changeset` you have to pull `main` & `develop`</b>

To release new version of package you need to create PR with changes and add changeset file to your commit.

```bash
bun changeset
```

After PR is merged to `develop` branch with changeset file, github action will create new PR with updated versions of packages and changelogs.
