# @swapkit/types

## 1.0.0-rc.47

### Patch Changes

- [`c046683`](https://github.com/thorswap/SwapKit/commit/c04668374869bffb3dbe5130e2136d158f592678) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Bump for latest

## 1.0.0-rc.46

### Patch Changes

- Bump for latest

## 1.0.0-rc.45

### Patch Changes

- [#677](https://github.com/thorswap/SwapKit/pull/677) [`5a59dc1`](https://github.com/thorswap/SwapKit/commit/5a59dc1fd8a46cb197e6d33ac5a0d9b5a2591d30) Thanks [@chillios-dev](https://github.com/chillios-dev)! - bump for all with ledger'

## 1.0.0-rc.44

### Patch Changes

- Bump for latest

## 1.0.0-rc.43

### Patch Changes

- Bump for latest

## 1.0.0-rc.42

### Patch Changes

- [`6a72433`](https://github.com/thorswap/SwapKit/commit/6a7243378dbe2a75451930759c50d0a5799c1522) Thanks [@chillios-dev](https://github.com/chillios-dev)! - bump deps

## 1.0.0-rc.41

### Patch Changes

- [`f85416f`](https://github.com/thorswap/SwapKit/commit/f85416fe52f979f7ca9da286e72ab1a691f9d92a) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Bump packages with sdk

## 1.0.0-rc.40

### Patch Changes

- Add Polkadot explorer url

## 1.0.0-rc.39

### Major Changes

- [#631](https://github.com/thorswap/SwapKit/pull/631) [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b) Thanks [@towanTG](https://github.com/towanTG)! - # Release of swapkit as multi-wallet/provider sdk by THORSwap

  ## Breaking changes

  - Wallet structure got flattened
  - Wallets do not support getAddress function anymore
  - Core got split into provider packages such as THORChain or ChainFlip and true core functionality. Old core structure is therefor deprecated

  ## Why the changes

  - Simple support of multiple swap providers. New providers just need to implement the swapping logic and will be supported by whole SwapKit ecosystem out of the box
  - We did not see the reason to hide the wallet address in a function, instead it is readable right from the wallet `core.getWallet(Chain.Bitcoin).address`
  - Flattening of wallet structure reduces complexity

  ## How to work with SwapKit

  ```
  const core = SwapKit<
      {
          thorchain: ReturnType<typeof ThorchainProvider>['methods'];
          chainflip: ReturnType<typeof ChainflipProvider>['methods'];
      },
      ConnectWalletType
  >({
      config: {
          stagenet: IS_STAGENET,
          covalentApiKey: COVALENT_API_KEY,
          ethplorerApiKey: ETHPLORER_API_KEY,
          blockchairApiKey: BLOCKCHAIR_API_KEY,
          walletConnectProjectId: WALLETCONNECT_PROJECT_ID,
      },
      wallets: supportedWallets,
      providers: [ThorchainProvider, ChainflipProvider],
      // if needed
      apis: {},
      rpcUrls: {},
  });

  // core functionality examples:
  const walletAddress = core.getWallet(Chain.Bitcoin).address
  const balance = await core.getBalance(Chain.Bitcoin)
  const validAddress = await core.validateAddress(address, chain)

  // provider specific methods:
  const withdrawTxHash = core.thorchain.withdraw(params)
  const withdrawTxHash = core.thorchain.nodeAction(params)
  const withdrawTxHash = core.thorchain.deposit(params)

  // Swapping
  const swapTxHash = core.swap({
      route,
      provider: {
          name,
          config
      }
  })

  ```

## 1.0.0-rc.38

### Patch Changes

- Update toolboxes for using proper address'

- [`ae90588`](https://github.com/thorswap/SwapKit/commit/ae90588732b6b71b4a2ea91d0bb83b7c0aca702c) Thanks [@towanTG](https://github.com/towanTG)! - Adds core plugin support for swap provider

## 1.0.0-rc.37

### Patch Changes

- [#599](https://github.com/thorswap/SwapKit/pull/599) [`173dbf7`](https://github.com/thorswap/SwapKit/commit/173dbf773d0ee77b96afa62fd8e66296c3a935fb) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Update and add new chain

## 1.0.0-rc.36

### Patch Changes

- [#592](https://github.com/thorswap/SwapKit/pull/592) [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4) Thanks [@towanTG](https://github.com/towanTG)! - Adds polkadot and chainflip

- [#592](https://github.com/thorswap/SwapKit/pull/592) [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4) Thanks [@towanTG](https://github.com/towanTG)! - Adds Substrate chains

## 1.0.0-rc.35

### Minor Changes

- [#593](https://github.com/thorswap/SwapKit/pull/593) [`87dfbe6`](https://github.com/thorswap/SwapKit/commit/87dfbe643ca25501204213f44380467e1adfcb14) Thanks [@olegpetroveth](https://github.com/olegpetroveth)! - Add Swap amount too low error code

## 1.0.0-rc.34

### Patch Changes

- [`3b7af80`](https://github.com/thorswap/SwapKit/commit/3b7af8085ecc7e279dbd639b3375a81cc740970a) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Add & retur new ledger errors from swapkit

## 1.0.0-rc.33

### Patch Changes

- [#560](https://github.com/thorswap/SwapKit/pull/560) [`93adbb8`](https://github.com/thorswap/SwapKit/commit/93adbb8eb39ea5ff94b5be692f81ca55abb52173) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Add api key header with config

## 1.0.0-rc.32

### Minor Changes

- [#549](https://github.com/thorswap/SwapKit/pull/549) [`d264aa5`](https://github.com/thorswap/SwapKit/commit/d264aa5534e7eec80040d7d31dbee97c3a3d57fe) Thanks [@olegpetroveth](https://github.com/olegpetroveth)! - Fix error message unsafe parsing

## 1.0.0-rc.31

### Patch Changes

- [`16ebec6`](https://github.com/thorswap/SwapKit/commit/16ebec6d5cbba777880ba24542f93a6a808c55a1) Thanks [@chillios-dev](https://github.com/chillios-dev)! - bump

## 1.0.0-rc.30

### Patch Changes

- bump

## 1.0.0-rc.29

### Minor Changes

- [#485](https://github.com/thorswap/SwapKit/pull/485) [`ba06185`](https://github.com/thorswap/SwapKit/commit/ba061858f0975717e16ddd743076839bbce5f616) Thanks [@olegpetroveth](https://github.com/olegpetroveth)! - Update error codes

## 1.0.0-rc.28

### Patch Changes

- [#479](https://github.com/thorswap/SwapKit/pull/479) [`180c4a4`](https://github.com/thorswap/SwapKit/commit/180c4a4c9d5443feec25199383800407c93bb30e) Thanks [@towanTG](https://github.com/towanTG)! - Adds OKx Mobile detection

## 1.0.0-rc.27

### Patch Changes

- [#473](https://github.com/thorswap/SwapKit/pull/473) [`0864ab0`](https://github.com/thorswap/SwapKit/commit/0864ab0201cdd55ad82f27f042e38fc27d623393) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Update imports

- bump packages

## 1.0.0-rc.26

### Patch Changes

- tokenlist bump[

## 1.0.0-rc.25

### Patch Changes

- [#439](https://github.com/thorswap/SwapKit/pull/439) [`853c3e79`](https://github.com/thorswap/SwapKit/commit/853c3e79d6e80c05cabedbea97c17f00db4b74b2) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Use Thorchain tokenlist only

## 1.0.0-rc.24

### Patch Changes

- Patch for @ledgerhq/live-network

## 1.0.0-rc.23

### Patch Changes

- Bump to sk links

## 1.0.0-rc.22

### Patch Changes

- Update addLiquidityPart for symmetrics

## 1.0.0-rc.21

### Patch Changes

- Bump for explorer & synths

## 1.0.0-rc.20

### Patch Changes

- Bump

## 1.0.0-rc.19

### Patch Changes

- tests

- toUrl

- [`9af9e284`](https://github.com/thorswap/SwapKit/commit/9af9e2845126818d4dace38457e219fffa1b3a8c) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Update toString on synths

## 1.0.0-rc.18

### Patch Changes

- Patch typeforce

## 1.0.0-rc.17

### Patch Changes

- [#414](https://github.com/thorswap/SwapKit/pull/414) [`2c3f649f`](https://github.com/thorswap/SwapKit/commit/2c3f649fdebb5463e51c2929d6b3091852a59e9c) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Fix Division precision

## 1.0.0-rc.16

### Patch Changes

- Update dependencies with crypto-js 4.2.0

## 1.0.0-rc.15

### Patch Changes

- Testout publish

## 1.0.0-rc.14

### Patch Changes

- Update package name generation

## 1.0.0-rc.13

### Patch Changes

- [#404](https://github.com/thorswap/SwapKit/pull/404) [`af8ed16f`](https://github.com/thorswap/SwapKit/commit/af8ed16f77d15570f99a6062b7ba81273ff84b29) Thanks [@chillios-ts](https://github.com/chillios-ts)! - New chains support for evm/cosmos wallets

## 1.0.0-rc.12

### Patch Changes

- bump packages

## 1.0.0-rc.11

### Patch Changes

- addLiquidityPart and fix toCurrency

## 1.0.0-rc.10

### Patch Changes

- remove cache asset

## 1.0.0-rc.9

### Patch Changes

- Performance rebuild for helpers

## 1.0.0-rc.8

### Patch Changes

- Bump all for types

## 1.0.0-rc.7

### Patch Changes

- Use referer from window when needed

## 1.0.0-rc.6

### Patch Changes

- [`2c7f246`](https://github.com/thorswap/SwapKit/commit/2c7f2467b43686fb3665e8899383705f435af85f) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Bump fetch wraper

## 1.0.0-rc.5

### Patch Changes

- add scam filter for balances

## 1.0.0-rc.4

### Patch Changes

- Fix cache

## 1.0.0-rc.3

### Patch Changes

- bump for keystore update

## 1.0.0-rc.2

### Patch Changes

- [`4ad62d8`](https://github.com/thorswap/SwapKit/commit/4ad62d82fb9f236753a2a2ee0c17cd3a8d57f23a) Thanks [@chillios-ts](https://github.com/chillios-ts)! - fix rpc connection

## 1.0.0-rc.1

### Patch Changes

- [#363](https://github.com/thorswap/SwapKit/pull/363) [`0e1d996`](https://github.com/thorswap/SwapKit/commit/0e1d99672a809f8e9017241930d3f1ce9ff6fc11) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Fix nodejs environment
