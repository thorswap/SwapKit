# @swapkit/wallet-keepkey

## 1.0.0-rc.23

### Patch Changes

- Updated dependencies [[`dc2e8fd`](https://github.com/thorswap/SwapKit/commit/dc2e8fd0a61e7399d622bc700b448d9570baf691)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.89

## 1.0.0-rc.22

### Patch Changes

- Updated dependencies [[`f4a2100`](https://github.com/thorswap/SwapKit/commit/f4a21006b37438d62f98f0fb1cae76adfad46d5e)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.88

## 1.0.0-rc.21

### Patch Changes

- Updated dependencies [[`da7e29d`](https://github.com/thorswap/SwapKit/commit/da7e29d12b58d9512ff8edc7a26a1bd4323ee706)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.87

## 1.0.0-rc.20

### Patch Changes

- Updated dependencies [[`9f0f764`](https://github.com/thorswap/SwapKit/commit/9f0f764569e440525ad6fa87eace2e1bc1c76e25)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.86
  - @swapkit/toolbox-utxo@1.0.0-rc.82

## 1.0.0-rc.19

### Patch Changes

- Updated dependencies [[`c17cb39`](https://github.com/thorswap/SwapKit/commit/c17cb390a9e1e7885c03f8d88d4383a447a5094e)]:
  - @swapkit/toolbox-utxo@1.0.0-rc.81

## 1.0.0-rc.18

### Patch Changes

- Updated dependencies [[`be94c11`](https://github.com/thorswap/SwapKit/commit/be94c113a31dab5ab468a3fb104ea881e060aec8)]:
  - @swapkit/toolbox-utxo@1.0.0-rc.80

## 1.0.0-rc.17

### Patch Changes

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.40
  - @swapkit/helpers@1.0.0-rc.74
  - @swapkit/toolbox-cosmos@1.0.0-rc.85
  - @swapkit/toolbox-evm@1.0.0-rc.80
  - @swapkit/toolbox-utxo@1.0.0-rc.79

## 1.0.0-rc.16

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

- Updated dependencies [[`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b), [`57f509a`](https://github.com/thorswap/SwapKit/commit/57f509ab7f28ae336c1aab459d796b4ef8e8eb1b)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.84
  - @swapkit/helpers@1.0.0-rc.73
  - @swapkit/toolbox-utxo@1.0.0-rc.78
  - @swapkit/types@1.0.0-rc.39
  - @swapkit/toolbox-evm@1.0.0-rc.79

## 1.0.0-rc.15

### Patch Changes

- Update toolboxes for using proper address'

- [`ae90588`](https://github.com/thorswap/SwapKit/commit/ae90588732b6b71b4a2ea91d0bb83b7c0aca702c) Thanks [@towanTG](https://github.com/towanTG)! - Adds core plugin support for swap provider

- Updated dependencies [[`ae90588`](https://github.com/thorswap/SwapKit/commit/ae90588732b6b71b4a2ea91d0bb83b7c0aca702c)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.83
  - @swapkit/helpers@1.0.0-rc.72
  - @swapkit/toolbox-utxo@1.0.0-rc.77
  - @swapkit/types@1.0.0-rc.38
  - @swapkit/toolbox-evm@1.0.0-rc.78

## 1.0.0-rc.14

### Patch Changes

- Updated dependencies [[`ec7f912`](https://github.com/thorswap/SwapKit/commit/ec7f9120cf2d82c66eaa4936312a6c56cfef68bf)]:
  - @swapkit/helpers@1.0.0-rc.71
  - @swapkit/toolbox-cosmos@1.0.0-rc.82
  - @swapkit/toolbox-evm@1.0.0-rc.77
  - @swapkit/toolbox-utxo@1.0.0-rc.76

## 1.0.0-rc.13

### Patch Changes

- Updated dependencies [[`9152f68`](https://github.com/thorswap/SwapKit/commit/9152f687714deb177ea0cf4528121dedd8e32358)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.81

## 1.0.0-rc.12

### Patch Changes

- [#614](https://github.com/thorswap/SwapKit/pull/614) [`fc98782`](https://github.com/thorswap/SwapKit/commit/fc9878251074c96da7c0b147a928651cf0ae55a0) Thanks [@towanTG](https://github.com/towanTG)! - Simplifies TC message creation and handling

- Updated dependencies [[`16f5b57`](https://github.com/thorswap/SwapKit/commit/16f5b570290df1339be9f140a19a6c831a2a875e), [`fc98782`](https://github.com/thorswap/SwapKit/commit/fc9878251074c96da7c0b147a928651cf0ae55a0)]:
  - @swapkit/helpers@1.0.0-rc.70
  - @swapkit/toolbox-cosmos@1.0.0-rc.80
  - @swapkit/toolbox-evm@1.0.0-rc.76
  - @swapkit/toolbox-utxo@1.0.0-rc.75

## 1.0.0-rc.11

### Patch Changes

- [#599](https://github.com/thorswap/SwapKit/pull/599) [`173dbf7`](https://github.com/thorswap/SwapKit/commit/173dbf773d0ee77b96afa62fd8e66296c3a935fb) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Update and add new chain

- Updated dependencies [[`173dbf7`](https://github.com/thorswap/SwapKit/commit/173dbf773d0ee77b96afa62fd8e66296c3a935fb)]:
  - @swapkit/helpers@1.0.0-rc.69
  - @swapkit/types@1.0.0-rc.37
  - @swapkit/toolbox-evm@1.0.0-rc.75
  - @swapkit/toolbox-cosmos@1.0.0-rc.79
  - @swapkit/toolbox-utxo@1.0.0-rc.74

## 1.0.0-rc.10

### Patch Changes

- Updated dependencies [[`9ea25ca`](https://github.com/thorswap/SwapKit/commit/9ea25ca0533c5f6f6f6130c21270954777f1aef7)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.78

## 1.0.0-rc.9

### Patch Changes

- Updated dependencies [[`4277084`](https://github.com/thorswap/SwapKit/commit/42770848d1796b08de31dad1e3ed2e70f90c8e8e)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.77

## 1.0.0-rc.8

### Patch Changes

- Updated dependencies [[`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4), [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4), [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4)]:
  - @swapkit/helpers@1.0.0-rc.68
  - @swapkit/types@1.0.0-rc.36
  - @swapkit/toolbox-evm@1.0.0-rc.74
  - @swapkit/toolbox-cosmos@1.0.0-rc.76
  - @swapkit/toolbox-utxo@1.0.0-rc.73

## 1.0.0-rc.7

### Patch Changes

- Updated dependencies [[`87dfbe6`](https://github.com/thorswap/SwapKit/commit/87dfbe643ca25501204213f44380467e1adfcb14)]:
  - @swapkit/types@1.0.0-rc.35
  - @swapkit/helpers@1.0.0-rc.67
  - @swapkit/toolbox-cosmos@1.0.0-rc.75
  - @swapkit/toolbox-evm@1.0.0-rc.73
  - @swapkit/toolbox-utxo@1.0.0-rc.72

## 1.0.0-rc.6

### Patch Changes

- Updated dependencies [[`692e678`](https://github.com/thorswap/SwapKit/commit/692e678dbad40165c133ba4d2db2d97f5dd22283), [`9c363d7`](https://github.com/thorswap/SwapKit/commit/9c363d7c6403e0dd6f1cef00cb3f79620c6e4a62)]:
  - @swapkit/helpers@1.0.0-rc.66
  - @swapkit/toolbox-cosmos@1.0.0-rc.74
  - @swapkit/toolbox-evm@1.0.0-rc.72
  - @swapkit/toolbox-utxo@1.0.0-rc.71

## 1.0.0-rc.5

### Patch Changes

- Updated dependencies [[`3b7af80`](https://github.com/thorswap/SwapKit/commit/3b7af8085ecc7e279dbd639b3375a81cc740970a)]:
  - @swapkit/helpers@1.0.0-rc.65
  - @swapkit/types@1.0.0-rc.34
  - @swapkit/toolbox-cosmos@1.0.0-rc.73
  - @swapkit/toolbox-evm@1.0.0-rc.71
  - @swapkit/toolbox-utxo@1.0.0-rc.70

## 1.0.0-rc.4

### Patch Changes

- Updated dependencies [[`1212387`](https://github.com/thorswap/SwapKit/commit/12123878da6c0aaa6e040d96dc392396d441d26b)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.72

## 1.0.0-rc.3

### Patch Changes

- [#560](https://github.com/thorswap/SwapKit/pull/560) [`93adbb8`](https://github.com/thorswap/SwapKit/commit/93adbb8eb39ea5ff94b5be692f81ca55abb52173) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Add api key header with config

- Updated dependencies [[`93adbb8`](https://github.com/thorswap/SwapKit/commit/93adbb8eb39ea5ff94b5be692f81ca55abb52173)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.71
  - @swapkit/helpers@1.0.0-rc.64
  - @swapkit/toolbox-utxo@1.0.0-rc.69
  - @swapkit/types@1.0.0-rc.33
  - @swapkit/toolbox-evm@1.0.0-rc.70

## 1.0.0-rc.2

### Patch Changes

- Updated dependencies [[`5e17413`](https://github.com/thorswap/SwapKit/commit/5e1741329a6902e68098a9ab9ea13ddfde653ea5)]:
  - @swapkit/toolbox-utxo@1.0.0-rc.68

## 1.0.0-rc.1

### Patch Changes

- [#536](https://github.com/thorswap/SwapKit/pull/536) [`692072d`](https://github.com/thorswap/SwapKit/commit/692072d94d38e35e1b22ea578a6a3ae6cf5340c0) Thanks [@towanTG](https://github.com/towanTG)! - KeepKey Wallet

- Updated dependencies [[`692072d`](https://github.com/thorswap/SwapKit/commit/692072d94d38e35e1b22ea578a6a3ae6cf5340c0)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.70
  - @swapkit/helpers@1.0.0-rc.63
  - @swapkit/toolbox-utxo@1.0.0-rc.67
  - @swapkit/toolbox-evm@1.0.0-rc.69
