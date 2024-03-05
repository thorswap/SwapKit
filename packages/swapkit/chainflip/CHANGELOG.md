# @swapkit/chainflip

## 1.0.0-rc.21

### Patch Changes

- Updated dependencies []:
  - @swapkit/core@1.0.0-rc.109

## 1.0.0-rc.20

### Patch Changes

- Updated dependencies []:
  - @swapkit/core@1.0.0-rc.108

## 1.0.0-rc.19

### Patch Changes

- Updated dependencies []:
  - @swapkit/core@1.0.0-rc.107

## 1.0.0-rc.18

### Patch Changes

- Updated dependencies []:
  - @swapkit/core@1.0.0-rc.106

## 1.0.0-rc.17

### Patch Changes

- Updated dependencies []:
  - @swapkit/core@1.0.0-rc.105

## 1.0.0-rc.16

### Patch Changes

- Updated dependencies []:
  - @swapkit/core@1.0.0-rc.104

## 1.0.0-rc.15

### Patch Changes

- Updated dependencies [[`be94c11`](https://github.com/thorswap/SwapKit/commit/be94c113a31dab5ab468a3fb104ea881e060aec8)]:
  - @swapkit/toolbox-substrate@1.0.0-rc.9
  - @swapkit/core@1.0.0-rc.103

## 1.0.0-rc.14

### Patch Changes

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.40
  - @swapkit/core@1.0.0-rc.102
  - @swapkit/helpers@1.0.0-rc.74
  - @swapkit/toolbox-evm@1.0.0-rc.80
  - @swapkit/toolbox-substrate@1.0.0-rc.8

## 1.0.0-rc.13

### Patch Changes

- [#635](https://github.com/thorswap/SwapKit/pull/635) [`ca3ba78`](https://github.com/thorswap/SwapKit/commit/ca3ba788a4fe8185b1d8be3c7a8a7c6089408333) Thanks [@towanTG](https://github.com/towanTG)! - Fixes from address for CF swap

## 1.0.0-rc.12

### Patch Changes

- [#633](https://github.com/thorswap/SwapKit/pull/633) [`afaed86`](https://github.com/thorswap/SwapKit/commit/afaed865dd283d4ea790956ea006eb6546fa9c93) Thanks [@towanTG](https://github.com/towanTG)! - Fixes address validation in FLIP broker

## 1.0.0-rc.11

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

- [#631](https://github.com/thorswap/SwapKit/pull/631) [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b) Thanks [@towanTG](https://github.com/towanTG)! - Fix typing

- Updated dependencies [[`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b), [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b), [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b), [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b), [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b)]:
  - @swapkit/toolbox-substrate@1.0.0-rc.7
  - @swapkit/helpers@1.0.0-rc.73
  - @swapkit/types@1.0.0-rc.39
  - @swapkit/toolbox-evm@1.0.0-rc.79
  - @swapkit/core@1.0.0-rc.101

## 1.0.0-rc.10

### Patch Changes

- Update toolboxes for using proper address'

- [#627](https://github.com/thorswap/SwapKit/pull/627) [`75324a2`](https://github.com/thorswap/SwapKit/commit/75324a2b34977d5730e46770abfdbf4008e94953) Thanks [@towanTG](https://github.com/towanTG)! - Fixes Plugin / Core split

- [`ae90588`](https://github.com/thorswap/SwapKit/commit/ae90588732b6b71b4a2ea91d0bb83b7c0aca702c) Thanks [@towanTG](https://github.com/towanTG)! - Adds core plugin support for swap provider

- Updated dependencies [[`75324a2`](https://github.com/thorswap/SwapKit/commit/75324a2b34977d5730e46770abfdbf4008e94953), [`ae90588`](https://github.com/thorswap/SwapKit/commit/ae90588732b6b71b4a2ea91d0bb83b7c0aca702c)]:
  - @swapkit/toolbox-substrate@1.0.0-rc.6
  - @swapkit/helpers@1.0.0-rc.72
  - @swapkit/types@1.0.0-rc.38
  - @swapkit/toolbox-evm@1.0.0-rc.78
  - @swapkit/core@1.0.0-rc.100

## 1.0.0-rc.9

### Patch Changes

- [#622](https://github.com/thorswap/SwapKit/pull/622) [`a3a7375`](https://github.com/thorswap/SwapKit/commit/a3a73754dbc1a2d5e77d53a2607f0e47c4690ec8) Thanks [@olegpetroveth](https://github.com/olegpetroveth)! - Update deposit channel id

## 1.0.0-rc.8

### Patch Changes

- Updated dependencies [[`ec7f912`](https://github.com/thorswap/SwapKit/commit/ec7f9120cf2d82c66eaa4936312a6c56cfef68bf)]:
  - @swapkit/helpers@1.0.0-rc.71
  - @swapkit/toolbox-evm@1.0.0-rc.77
  - @swapkit/toolbox-substrate@1.0.0-rc.5

## 1.0.0-rc.7

### Patch Changes

- Updated dependencies [[`16f5b57`](https://github.com/thorswap/SwapKit/commit/16f5b570290df1339be9f140a19a6c831a2a875e)]:
  - @swapkit/helpers@1.0.0-rc.70
  - @swapkit/toolbox-evm@1.0.0-rc.76
  - @swapkit/toolbox-substrate@1.0.0-rc.4

## 1.0.0-rc.6

### Patch Changes

- [#612](https://github.com/thorswap/SwapKit/pull/612) [`7d42e28`](https://github.com/thorswap/SwapKit/commit/7d42e283b5051abdd33c4474b0ad8c832a4ec70b) Thanks [@towanTG](https://github.com/towanTG)! - Fixes the response and request of the chainflip broker

## 1.0.0-rc.5

### Patch Changes

- Updated dependencies [[`173dbf7`](https://github.com/thorswap/SwapKit/commit/173dbf773d0ee77b96afa62fd8e66296c3a935fb)]:
  - @swapkit/helpers@1.0.0-rc.69
  - @swapkit/toolbox-evm@1.0.0-rc.75
  - @swapkit/toolbox-substrate@1.0.0-rc.3

## 1.0.0-rc.4

### Patch Changes

- [#602](https://github.com/thorswap/SwapKit/pull/602) [`6cf4eec`](https://github.com/thorswap/SwapKit/commit/6cf4eec820b012c3a3b07e2aeee7436b4367bdef) Thanks [@towanTG](https://github.com/towanTG)! - Fix deposit address request

## 1.0.0-rc.3

### Patch Changes

- [#600](https://github.com/thorswap/SwapKit/pull/600) [`e600008`](https://github.com/thorswap/SwapKit/commit/e6000086efe90c5b9d1002931fd7524a48204b92) Thanks [@towanTG](https://github.com/towanTG)! - Fixes tx response handling for broker

## 1.0.0-rc.2

### Patch Changes

- [#592](https://github.com/thorswap/SwapKit/pull/592) [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4) Thanks [@towanTG](https://github.com/towanTG)! - Adds polkadot integration to keystore and ledger

- Updated dependencies [[`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4), [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4)]:
  - @swapkit/helpers@1.0.0-rc.68
  - @swapkit/toolbox-substrate@1.0.0-rc.2
  - @swapkit/toolbox-evm@1.0.0-rc.74
