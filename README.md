# SwapKit

### _Integrate Blockchains easily_

## Usage

### Documentation

- [Getting Started](https://docs.thorswap.finance/swapkit-docs)

- [Packages](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/packages)
- [Wallets](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/wallets)
- [Toolboxes](https://docs.thorswap.finance/swapkit-docs/swapkit-sdk/toolboxes)

## Packages

This repo contains packages around SwapKit sdk and its integrations with different blockchains.

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
