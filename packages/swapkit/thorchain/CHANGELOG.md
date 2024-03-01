# @swapkit/thorchain

## 1.0.0-rc.7

### Patch Changes

- Updated dependencies [[`9f0f764`](https://github.com/thorswap/SwapKit/commit/9f0f764569e440525ad6fa87eace2e1bc1c76e25)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.86
  - @swapkit/toolbox-utxo@1.0.0-rc.82
  - @swapkit/core@1.0.0-rc.105

## 1.0.0-rc.6

### Patch Changes

- Updated dependencies [[`c17cb39`](https://github.com/thorswap/SwapKit/commit/c17cb390a9e1e7885c03f8d88d4383a447a5094e)]:
  - @swapkit/toolbox-utxo@1.0.0-rc.81
  - @swapkit/core@1.0.0-rc.104

## 1.0.0-rc.5

### Patch Changes

- Updated dependencies [[`be94c11`](https://github.com/thorswap/SwapKit/commit/be94c113a31dab5ab468a3fb104ea881e060aec8)]:
  - @swapkit/toolbox-substrate@1.0.0-rc.9
  - @swapkit/toolbox-utxo@1.0.0-rc.80
  - @swapkit/core@1.0.0-rc.103

## 1.0.0-rc.4

### Patch Changes

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.40
  - @swapkit/core@1.0.0-rc.102
  - @swapkit/helpers@1.0.0-rc.74
  - @swapkit/toolbox-cosmos@1.0.0-rc.85
  - @swapkit/toolbox-evm@1.0.0-rc.80
  - @swapkit/toolbox-substrate@1.0.0-rc.8
  - @swapkit/toolbox-utxo@1.0.0-rc.79

## 1.0.0-rc.3

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

- [#631](https://github.com/thorswap/SwapKit/pull/631) [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b) Thanks [@towanTG](https://github.com/towanTG)! - Adds thorchain specific approve

- [#631](https://github.com/thorswap/SwapKit/pull/631) [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b) Thanks [@towanTG](https://github.com/towanTG)! - Fixes thorchain approve arguments

- [#631](https://github.com/thorswap/SwapKit/pull/631) [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b) Thanks [@towanTG](https://github.com/towanTG)! - Fix typing

- [#631](https://github.com/thorswap/SwapKit/pull/631) [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b) Thanks [@towanTG](https://github.com/towanTG)! - Adds proxy methods for thorchain approve

- Updated dependencies [[`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b), [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b), [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b), [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b), [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b)]:
  - @swapkit/toolbox-substrate@1.0.0-rc.7
  - @swapkit/toolbox-cosmos@1.0.0-rc.84
  - @swapkit/helpers@1.0.0-rc.73
  - @swapkit/toolbox-utxo@1.0.0-rc.78
  - @swapkit/types@1.0.0-rc.39
  - @swapkit/toolbox-evm@1.0.0-rc.79
  - @swapkit/core@1.0.0-rc.101

## 1.0.0-rc.2

### Patch Changes

- Update toolboxes for using proper address'

- [#627](https://github.com/thorswap/SwapKit/pull/627) [`75324a2`](https://github.com/thorswap/SwapKit/commit/75324a2b34977d5730e46770abfdbf4008e94953) Thanks [@towanTG](https://github.com/towanTG)! - Fixes Plugin / Core split

- [`ae90588`](https://github.com/thorswap/SwapKit/commit/ae90588732b6b71b4a2ea91d0bb83b7c0aca702c) Thanks [@towanTG](https://github.com/towanTG)! - Adds core plugin support for swap provider

- Updated dependencies [[`75324a2`](https://github.com/thorswap/SwapKit/commit/75324a2b34977d5730e46770abfdbf4008e94953), [`ae90588`](https://github.com/thorswap/SwapKit/commit/ae90588732b6b71b4a2ea91d0bb83b7c0aca702c)]:
  - @swapkit/toolbox-substrate@1.0.0-rc.6
  - @swapkit/toolbox-cosmos@1.0.0-rc.83
  - @swapkit/helpers@1.0.0-rc.72
  - @swapkit/toolbox-utxo@1.0.0-rc.77
  - @swapkit/types@1.0.0-rc.38
  - @swapkit/toolbox-evm@1.0.0-rc.78
  - @swapkit/core@1.0.0-rc.100
