# @swapkit/api

## 1.0.0-rc.40

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

### Patch Changes

- Updated dependencies [[`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b)]:
  - @swapkit/types@1.0.0-rc.39

## 1.0.0-rc.39

### Patch Changes

- Update toolboxes for using proper address'

- Updated dependencies [[`ae90588`](https://github.com/thorswap/SwapKit/commit/ae90588732b6b71b4a2ea91d0bb83b7c0aca702c)]:
  - @swapkit/types@1.0.0-rc.38

## 1.0.0-rc.38

### Patch Changes

- Updated dependencies [[`173dbf7`](https://github.com/thorswap/SwapKit/commit/173dbf773d0ee77b96afa62fd8e66296c3a935fb)]:
  - @swapkit/types@1.0.0-rc.37

## 1.0.0-rc.37

### Patch Changes

- Updated dependencies [[`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4), [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4)]:
  - @swapkit/types@1.0.0-rc.36

## 1.0.0-rc.36

### Patch Changes

- Updated dependencies [[`87dfbe6`](https://github.com/thorswap/SwapKit/commit/87dfbe643ca25501204213f44380467e1adfcb14)]:
  - @swapkit/types@1.0.0-rc.35

## 1.0.0-rc.35

### Patch Changes

- Updated dependencies [[`3b7af80`](https://github.com/thorswap/SwapKit/commit/3b7af8085ecc7e279dbd639b3375a81cc740970a)]:
  - @swapkit/types@1.0.0-rc.34

## 1.0.0-rc.34

### Patch Changes

- [#560](https://github.com/thorswap/SwapKit/pull/560) [`93adbb8`](https://github.com/thorswap/SwapKit/commit/93adbb8eb39ea5ff94b5be692f81ca55abb52173) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Add api key header with config

- Updated dependencies [[`93adbb8`](https://github.com/thorswap/SwapKit/commit/93adbb8eb39ea5ff94b5be692f81ca55abb52173)]:
  - @swapkit/types@1.0.0-rc.33

## 1.0.0-rc.33

### Patch Changes

- Updated dependencies [[`d264aa5`](https://github.com/thorswap/SwapKit/commit/d264aa5534e7eec80040d7d31dbee97c3a3d57fe)]:
  - @swapkit/types@1.0.0-rc.32

## 1.0.0-rc.32

### Patch Changes

- [#515](https://github.com/thorswap/SwapKit/pull/515) [`bf24a16`](https://github.com/thorswap/SwapKit/commit/bf24a1667130a18e4748cb449625e33090d025a7) Thanks [@towanTG](https://github.com/towanTG)! - Adds support for evm contract params from quote route

## 1.0.0-rc.31

### Patch Changes

- [`16ebec6`](https://github.com/thorswap/SwapKit/commit/16ebec6d5cbba777880ba24542f93a6a808c55a1) Thanks [@chillios-dev](https://github.com/chillios-dev)! - bump

- Updated dependencies [[`16ebec6`](https://github.com/thorswap/SwapKit/commit/16ebec6d5cbba777880ba24542f93a6a808c55a1)]:
  - @swapkit/types@1.0.0-rc.31

## 1.0.0-rc.30

### Patch Changes

- bump

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.30

## 1.0.0-rc.29

### Patch Changes

- Updated dependencies [[`ba06185`](https://github.com/thorswap/SwapKit/commit/ba061858f0975717e16ddd743076839bbce5f616)]:
  - @swapkit/types@1.0.0-rc.29

## 1.0.0-rc.28

### Patch Changes

- Updated dependencies [[`180c4a4`](https://github.com/thorswap/SwapKit/commit/180c4a4c9d5443feec25199383800407c93bb30e)]:
  - @swapkit/types@1.0.0-rc.28

## 1.0.0-rc.27

### Patch Changes

- [#473](https://github.com/thorswap/SwapKit/pull/473) [`0864ab0`](https://github.com/thorswap/SwapKit/commit/0864ab0201cdd55ad82f27f042e38fc27d623393) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Update imports

- bump packages

- Updated dependencies [[`0864ab0`](https://github.com/thorswap/SwapKit/commit/0864ab0201cdd55ad82f27f042e38fc27d623393)]:
  - @swapkit/types@1.0.0-rc.27

## 1.0.0-rc.26

### Patch Changes

- tokenlist bump[

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.26

## 1.0.0-rc.25

### Patch Changes

- [#439](https://github.com/thorswap/SwapKit/pull/439) [`853c3e79`](https://github.com/thorswap/SwapKit/commit/853c3e79d6e80c05cabedbea97c17f00db4b74b2) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Use Thorchain tokenlist only

- Updated dependencies [[`853c3e79`](https://github.com/thorswap/SwapKit/commit/853c3e79d6e80c05cabedbea97c17f00db4b74b2)]:
  - @swapkit/types@1.0.0-rc.25

## 1.0.0-rc.24

### Patch Changes

- Patch for @ledgerhq/live-network

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.24

## 1.0.0-rc.23

### Patch Changes

- Bump to sk links

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.23

## 1.0.0-rc.22

### Patch Changes

- Update addLiquidityPart for symmetrics

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.22

## 1.0.0-rc.21

### Patch Changes

- Bump for explorer & synths

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.21

## 1.0.0-rc.20

### Patch Changes

- Bump

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.20

## 1.0.0-rc.19

### Patch Changes

- tests

- toUrl

- [`9af9e284`](https://github.com/thorswap/SwapKit/commit/9af9e2845126818d4dace38457e219fffa1b3a8c) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Update toString on synths

- Updated dependencies [[`9af9e284`](https://github.com/thorswap/SwapKit/commit/9af9e2845126818d4dace38457e219fffa1b3a8c)]:
  - @swapkit/types@1.0.0-rc.19

## 1.0.0-rc.18

### Patch Changes

- Patch typeforce

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.18

## 1.0.0-rc.17

### Patch Changes

- [#414](https://github.com/thorswap/SwapKit/pull/414) [`2c3f649f`](https://github.com/thorswap/SwapKit/commit/2c3f649fdebb5463e51c2929d6b3091852a59e9c) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Fix Division precision

- Updated dependencies [[`2c3f649f`](https://github.com/thorswap/SwapKit/commit/2c3f649fdebb5463e51c2929d6b3091852a59e9c)]:
  - @swapkit/types@1.0.0-rc.17

## 1.0.0-rc.16

### Patch Changes

- Update dependencies with crypto-js 4.2.0

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.16

## 1.0.0-rc.15

### Patch Changes

- Testout publish

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.15

## 1.0.0-rc.14

### Patch Changes

- Update package name generation

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.14

## 1.0.0-rc.13

### Patch Changes

- [#404](https://github.com/thorswap/SwapKit/pull/404) [`af8ed16f`](https://github.com/thorswap/SwapKit/commit/af8ed16f77d15570f99a6062b7ba81273ff84b29) Thanks [@chillios-ts](https://github.com/chillios-ts)! - New chains support for evm/cosmos wallets

- Updated dependencies [[`af8ed16f`](https://github.com/thorswap/SwapKit/commit/af8ed16f77d15570f99a6062b7ba81273ff84b29)]:
  - @swapkit/types@1.0.0-rc.13

## 1.0.0-rc.12

### Patch Changes

- bump packages

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.12

## 1.0.0-rc.11

### Patch Changes

- addLiquidityPart and fix toCurrency

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.11

## 1.0.0-rc.10

### Patch Changes

- remove cache asset

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.10

## 1.0.0-rc.9

### Patch Changes

- Performance rebuild for helpers

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.9

## 1.0.0-rc.8

### Patch Changes

- Bump all for types

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.8

## 1.0.0-rc.7

### Patch Changes

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.7

## 1.0.0-rc.6

### Patch Changes

- [`2c7f246`](https://github.com/thorswap/SwapKit/commit/2c7f2467b43686fb3665e8899383705f435af85f) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Bump fetch wraper

- Updated dependencies [[`2c7f246`](https://github.com/thorswap/SwapKit/commit/2c7f2467b43686fb3665e8899383705f435af85f)]:
  - @swapkit/types@1.0.0-rc.6

## 1.0.0-rc.5

### Patch Changes

- add scam filter for balances

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.5

## 1.0.0-rc.4

### Patch Changes

- Fix cache

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.4

## 1.0.0-rc.3

### Patch Changes

- bump for keystore update

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.3

## 1.0.0-rc.2

### Patch Changes

- [`4ad62d8`](https://github.com/thorswap/SwapKit/commit/4ad62d82fb9f236753a2a2ee0c17cd3a8d57f23a) Thanks [@chillios-ts](https://github.com/chillios-ts)! - fix rpc connection

- Updated dependencies [[`4ad62d8`](https://github.com/thorswap/SwapKit/commit/4ad62d82fb9f236753a2a2ee0c17cd3a8d57f23a)]:
  - @swapkit/types@1.0.0-rc.2

## 1.0.0-rc.1

### Patch Changes

- [#363](https://github.com/thorswap/SwapKit/pull/363) [`0e1d996`](https://github.com/thorswap/SwapKit/commit/0e1d99672a809f8e9017241930d3f1ce9ff6fc11) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Fix nodejs environment

- Updated dependencies [[`0e1d996`](https://github.com/thorswap/SwapKit/commit/0e1d99672a809f8e9017241930d3f1ce9ff6fc11)]:
  - @swapkit/types@1.0.0-rc.1
