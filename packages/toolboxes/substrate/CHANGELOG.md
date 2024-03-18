# @swapkit/toolbox-substrate

## 1.0.0-rc.12

### Patch Changes

- Bump for latest

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.77
  - @swapkit/types@1.0.0-rc.43

## 1.0.0-rc.11

### Patch Changes

- [`6a72433`](https://github.com/thorswap/SwapKit/commit/6a7243378dbe2a75451930759c50d0a5799c1522) Thanks [@chillios-dev](https://github.com/chillios-dev)! - bump deps

- Updated dependencies [[`6a72433`](https://github.com/thorswap/SwapKit/commit/6a7243378dbe2a75451930759c50d0a5799c1522)]:
  - @swapkit/helpers@1.0.0-rc.76
  - @swapkit/types@1.0.0-rc.42

## 1.0.0-rc.10

### Patch Changes

- [`f85416f`](https://github.com/thorswap/SwapKit/commit/f85416fe52f979f7ca9da286e72ab1a691f9d92a) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Bump packages with sdk

- Updated dependencies [[`f85416f`](https://github.com/thorswap/SwapKit/commit/f85416fe52f979f7ca9da286e72ab1a691f9d92a)]:
  - @swapkit/helpers@1.0.0-rc.75
  - @swapkit/types@1.0.0-rc.41

## 1.0.0-rc.9

### Patch Changes

- [#637](https://github.com/thorswap/SwapKit/pull/637) [`be94c11`](https://github.com/thorswap/SwapKit/commit/be94c113a31dab5ab468a3fb104ea881e060aec8) Thanks [@towanTG](https://github.com/towanTG)! - Allows sending BTC to taproot and updates DOT transfer

## 1.0.0-rc.8

### Patch Changes

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.40
  - @swapkit/helpers@1.0.0-rc.74

## 1.0.0-rc.7

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

- [#631](https://github.com/thorswap/SwapKit/pull/631) [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b) Thanks [@towanTG](https://github.com/towanTG)! - Adds chainflip broker address validation for polkadot

- Updated dependencies [[`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b), [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b)]:
  - @swapkit/helpers@1.0.0-rc.73
  - @swapkit/types@1.0.0-rc.39

## 1.0.0-rc.6

### Patch Changes

- Update toolboxes for using proper address'

- Updated dependencies [[`ae90588`](https://github.com/thorswap/SwapKit/commit/ae90588732b6b71b4a2ea91d0bb83b7c0aca702c)]:
  - @swapkit/helpers@1.0.0-rc.72
  - @swapkit/types@1.0.0-rc.38

## 1.0.0-rc.5

### Patch Changes

- Updated dependencies [[`ec7f912`](https://github.com/thorswap/SwapKit/commit/ec7f9120cf2d82c66eaa4936312a6c56cfef68bf)]:
  - @swapkit/helpers@1.0.0-rc.71

## 1.0.0-rc.4

### Patch Changes

- Updated dependencies [[`16f5b57`](https://github.com/thorswap/SwapKit/commit/16f5b570290df1339be9f140a19a6c831a2a875e)]:
  - @swapkit/helpers@1.0.0-rc.70

## 1.0.0-rc.3

### Patch Changes

- Updated dependencies [[`173dbf7`](https://github.com/thorswap/SwapKit/commit/173dbf773d0ee77b96afa62fd8e66296c3a935fb)]:
  - @swapkit/helpers@1.0.0-rc.69
  - @swapkit/types@1.0.0-rc.37

## 1.0.0-rc.2

### Patch Changes

- [#592](https://github.com/thorswap/SwapKit/pull/592) [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4) Thanks [@towanTG](https://github.com/towanTG)! - Adds polkadot integration to keystore and ledger

- Updated dependencies [[`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4), [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4)]:
  - @swapkit/helpers@1.0.0-rc.68
  - @swapkit/types@1.0.0-rc.36
