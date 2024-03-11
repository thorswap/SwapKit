# @swapkit/wallet-keystore

## 1.0.0-rc.104

### Patch Changes

- Updated dependencies [[`3ad70c5`](https://github.com/thorswap/SwapKit/commit/3ad70c535de860fc2f424f7f2ab28a305b359af0)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.91

## 1.0.0-rc.103

### Patch Changes

- Updated dependencies [[`6226f25`](https://github.com/thorswap/SwapKit/commit/6226f25516a2455a6d0a1a1793afe1b9641758a3)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.90

## 1.0.0-rc.102

### Patch Changes

- Updated dependencies [[`dc2e8fd`](https://github.com/thorswap/SwapKit/commit/dc2e8fd0a61e7399d622bc700b448d9570baf691)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.89

## 1.0.0-rc.101

### Patch Changes

- Updated dependencies [[`f4a2100`](https://github.com/thorswap/SwapKit/commit/f4a21006b37438d62f98f0fb1cae76adfad46d5e)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.88

## 1.0.0-rc.100

### Patch Changes

- Updated dependencies [[`da7e29d`](https://github.com/thorswap/SwapKit/commit/da7e29d12b58d9512ff8edc7a26a1bd4323ee706)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.87

## 1.0.0-rc.99

### Patch Changes

- Updated dependencies [[`9f0f764`](https://github.com/thorswap/SwapKit/commit/9f0f764569e440525ad6fa87eace2e1bc1c76e25)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.86
  - @swapkit/toolbox-utxo@1.0.0-rc.82

## 1.0.0-rc.98

### Patch Changes

- Updated dependencies [[`c17cb39`](https://github.com/thorswap/SwapKit/commit/c17cb390a9e1e7885c03f8d88d4383a447a5094e)]:
  - @swapkit/toolbox-utxo@1.0.0-rc.81

## 1.0.0-rc.97

### Patch Changes

- Updated dependencies [[`be94c11`](https://github.com/thorswap/SwapKit/commit/be94c113a31dab5ab468a3fb104ea881e060aec8)]:
  - @swapkit/toolbox-substrate@1.0.0-rc.9
  - @swapkit/toolbox-utxo@1.0.0-rc.80

## 1.0.0-rc.96

### Patch Changes

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.40
  - @swapkit/helpers@1.0.0-rc.74
  - @swapkit/toolbox-cosmos@1.0.0-rc.85
  - @swapkit/toolbox-evm@1.0.0-rc.80
  - @swapkit/toolbox-substrate@1.0.0-rc.8
  - @swapkit/toolbox-utxo@1.0.0-rc.79

## 1.0.0-rc.95

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
  - @swapkit/toolbox-substrate@1.0.0-rc.7
  - @swapkit/toolbox-cosmos@1.0.0-rc.84
  - @swapkit/helpers@1.0.0-rc.73
  - @swapkit/toolbox-utxo@1.0.0-rc.78
  - @swapkit/types@1.0.0-rc.39
  - @swapkit/toolbox-evm@1.0.0-rc.79

## 1.0.0-rc.94

### Patch Changes

- Update toolboxes for using proper address'

- [`ae90588`](https://github.com/thorswap/SwapKit/commit/ae90588732b6b71b4a2ea91d0bb83b7c0aca702c) Thanks [@towanTG](https://github.com/towanTG)! - Adds core plugin support for swap provider

- Updated dependencies [[`ae90588`](https://github.com/thorswap/SwapKit/commit/ae90588732b6b71b4a2ea91d0bb83b7c0aca702c)]:
  - @swapkit/toolbox-substrate@1.0.0-rc.6
  - @swapkit/toolbox-cosmos@1.0.0-rc.83
  - @swapkit/helpers@1.0.0-rc.72
  - @swapkit/toolbox-utxo@1.0.0-rc.77
  - @swapkit/types@1.0.0-rc.38
  - @swapkit/toolbox-evm@1.0.0-rc.78

## 1.0.0-rc.93

### Patch Changes

- Updated dependencies [[`ec7f912`](https://github.com/thorswap/SwapKit/commit/ec7f9120cf2d82c66eaa4936312a6c56cfef68bf)]:
  - @swapkit/helpers@1.0.0-rc.71
  - @swapkit/toolbox-cosmos@1.0.0-rc.82
  - @swapkit/toolbox-evm@1.0.0-rc.77
  - @swapkit/toolbox-substrate@1.0.0-rc.5
  - @swapkit/toolbox-utxo@1.0.0-rc.76

## 1.0.0-rc.92

### Patch Changes

- Updated dependencies [[`9152f68`](https://github.com/thorswap/SwapKit/commit/9152f687714deb177ea0cf4528121dedd8e32358)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.81

## 1.0.0-rc.91

### Patch Changes

- [#614](https://github.com/thorswap/SwapKit/pull/614) [`fc98782`](https://github.com/thorswap/SwapKit/commit/fc9878251074c96da7c0b147a928651cf0ae55a0) Thanks [@towanTG](https://github.com/towanTG)! - Simplifies TC message creation and handling

- Updated dependencies [[`16f5b57`](https://github.com/thorswap/SwapKit/commit/16f5b570290df1339be9f140a19a6c831a2a875e), [`fc98782`](https://github.com/thorswap/SwapKit/commit/fc9878251074c96da7c0b147a928651cf0ae55a0)]:
  - @swapkit/helpers@1.0.0-rc.70
  - @swapkit/toolbox-cosmos@1.0.0-rc.80
  - @swapkit/toolbox-evm@1.0.0-rc.76
  - @swapkit/toolbox-substrate@1.0.0-rc.4
  - @swapkit/toolbox-utxo@1.0.0-rc.75

## 1.0.0-rc.90

### Patch Changes

- Updated dependencies [[`173dbf7`](https://github.com/thorswap/SwapKit/commit/173dbf773d0ee77b96afa62fd8e66296c3a935fb)]:
  - @swapkit/helpers@1.0.0-rc.69
  - @swapkit/types@1.0.0-rc.37
  - @swapkit/toolbox-evm@1.0.0-rc.75
  - @swapkit/toolbox-cosmos@1.0.0-rc.79
  - @swapkit/toolbox-substrate@1.0.0-rc.3
  - @swapkit/toolbox-utxo@1.0.0-rc.74

## 1.0.0-rc.89

### Patch Changes

- Updated dependencies [[`9ea25ca`](https://github.com/thorswap/SwapKit/commit/9ea25ca0533c5f6f6f6130c21270954777f1aef7)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.78

## 1.0.0-rc.88

### Patch Changes

- Updated dependencies [[`4277084`](https://github.com/thorswap/SwapKit/commit/42770848d1796b08de31dad1e3ed2e70f90c8e8e)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.77

## 1.0.0-rc.87

### Patch Changes

- [#592](https://github.com/thorswap/SwapKit/pull/592) [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4) Thanks [@towanTG](https://github.com/towanTG)! - Adds polkadot integration to keystore and ledger

- Updated dependencies [[`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4), [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4), [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4)]:
  - @swapkit/helpers@1.0.0-rc.68
  - @swapkit/types@1.0.0-rc.36
  - @swapkit/toolbox-substrate@1.0.0-rc.2
  - @swapkit/toolbox-evm@1.0.0-rc.74
  - @swapkit/toolbox-cosmos@1.0.0-rc.76
  - @swapkit/toolbox-utxo@1.0.0-rc.73

## 1.0.0-rc.86

### Patch Changes

- Updated dependencies [[`87dfbe6`](https://github.com/thorswap/SwapKit/commit/87dfbe643ca25501204213f44380467e1adfcb14)]:
  - @swapkit/types@1.0.0-rc.35
  - @swapkit/helpers@1.0.0-rc.67
  - @swapkit/toolbox-cosmos@1.0.0-rc.75
  - @swapkit/toolbox-evm@1.0.0-rc.73
  - @swapkit/toolbox-utxo@1.0.0-rc.72

## 1.0.0-rc.85

### Patch Changes

- [#591](https://github.com/thorswap/SwapKit/pull/591) [`9c363d7`](https://github.com/thorswap/SwapKit/commit/9c363d7c6403e0dd6f1cef00cb3f79620c6e4a62) Thanks [@towanTG](https://github.com/towanTG)! - Adds sign and verify message to TC wallets

- Updated dependencies [[`692e678`](https://github.com/thorswap/SwapKit/commit/692e678dbad40165c133ba4d2db2d97f5dd22283), [`9c363d7`](https://github.com/thorswap/SwapKit/commit/9c363d7c6403e0dd6f1cef00cb3f79620c6e4a62)]:
  - @swapkit/helpers@1.0.0-rc.66
  - @swapkit/toolbox-cosmos@1.0.0-rc.74
  - @swapkit/toolbox-evm@1.0.0-rc.72
  - @swapkit/toolbox-utxo@1.0.0-rc.71

## 1.0.0-rc.84

### Patch Changes

- Updated dependencies [[`3b7af80`](https://github.com/thorswap/SwapKit/commit/3b7af8085ecc7e279dbd639b3375a81cc740970a)]:
  - @swapkit/helpers@1.0.0-rc.65
  - @swapkit/types@1.0.0-rc.34
  - @swapkit/toolbox-cosmos@1.0.0-rc.73
  - @swapkit/toolbox-evm@1.0.0-rc.71
  - @swapkit/toolbox-utxo@1.0.0-rc.70

## 1.0.0-rc.83

### Patch Changes

- Updated dependencies [[`1212387`](https://github.com/thorswap/SwapKit/commit/12123878da6c0aaa6e040d96dc392396d441d26b)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.72

## 1.0.0-rc.82

### Patch Changes

- [#560](https://github.com/thorswap/SwapKit/pull/560) [`93adbb8`](https://github.com/thorswap/SwapKit/commit/93adbb8eb39ea5ff94b5be692f81ca55abb52173) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Add api key header with config

- Updated dependencies [[`93adbb8`](https://github.com/thorswap/SwapKit/commit/93adbb8eb39ea5ff94b5be692f81ca55abb52173)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.71
  - @swapkit/helpers@1.0.0-rc.64
  - @swapkit/toolbox-utxo@1.0.0-rc.69
  - @swapkit/types@1.0.0-rc.33
  - @swapkit/toolbox-evm@1.0.0-rc.70

## 1.0.0-rc.81

### Patch Changes

- Updated dependencies [[`5e17413`](https://github.com/thorswap/SwapKit/commit/5e1741329a6902e68098a9ab9ea13ddfde653ea5)]:
  - @swapkit/toolbox-utxo@1.0.0-rc.68

## 1.0.0-rc.80

### Patch Changes

- [#536](https://github.com/thorswap/SwapKit/pull/536) [`692072d`](https://github.com/thorswap/SwapKit/commit/692072d94d38e35e1b22ea578a6a3ae6cf5340c0) Thanks [@towanTG](https://github.com/towanTG)! - KeepKey Wallet

- Updated dependencies [[`692072d`](https://github.com/thorswap/SwapKit/commit/692072d94d38e35e1b22ea578a6a3ae6cf5340c0)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.70
  - @swapkit/helpers@1.0.0-rc.63
  - @swapkit/toolbox-utxo@1.0.0-rc.67
  - @swapkit/toolbox-evm@1.0.0-rc.69

## 1.0.0-rc.79

### Patch Changes

- Updated dependencies [[`497ecd7`](https://github.com/thorswap/SwapKit/commit/497ecd7e42278c2057e4d53e1fff94f09cc96a58)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.69
  - @swapkit/helpers@1.0.0-rc.62
  - @swapkit/toolbox-evm@1.0.0-rc.68
  - @swapkit/toolbox-utxo@1.0.0-rc.66

## 1.0.0-rc.78

### Patch Changes

- Updated dependencies [[`d264aa5`](https://github.com/thorswap/SwapKit/commit/d264aa5534e7eec80040d7d31dbee97c3a3d57fe)]:
  - @swapkit/types@1.0.0-rc.32
  - @swapkit/helpers@1.0.0-rc.61
  - @swapkit/toolbox-cosmos@1.0.0-rc.68
  - @swapkit/toolbox-evm@1.0.0-rc.67
  - @swapkit/toolbox-utxo@1.0.0-rc.65

## 1.0.0-rc.77

### Patch Changes

- Updated dependencies [[`4e3edb9`](https://github.com/thorswap/SwapKit/commit/4e3edb9742c1607aebb0bffd453d471c60a0076e)]:
  - @swapkit/toolbox-utxo@1.0.0-rc.64
  - @swapkit/toolbox-evm@1.0.0-rc.66

## 1.0.0-rc.76

### Patch Changes

- Updated dependencies [[`09ef478`](https://github.com/thorswap/SwapKit/commit/09ef478734821fa2e16f8845b4cf6675353deaad)]:
  - @swapkit/helpers@1.0.0-rc.60
  - @swapkit/toolbox-cosmos@1.0.0-rc.67
  - @swapkit/toolbox-evm@1.0.0-rc.65
  - @swapkit/toolbox-utxo@1.0.0-rc.63

## 1.0.0-rc.75

### Patch Changes

- Updated dependencies [[`5af3fe3`](https://github.com/thorswap/SwapKit/commit/5af3fe3abc0eb94d00ec3e35b4684d997ba426e7)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.66

## 1.0.0-rc.74

### Patch Changes

- Updated dependencies [[`bf24a16`](https://github.com/thorswap/SwapKit/commit/bf24a1667130a18e4748cb449625e33090d025a7)]:
  - @swapkit/toolbox-evm@1.0.0-rc.64
  - @swapkit/toolbox-cosmos@1.0.0-rc.65

## 1.0.0-rc.73

### Patch Changes

- Updated dependencies [[`876a4af`](https://github.com/thorswap/SwapKit/commit/876a4afbbe1c7face3aedf30abcf754a0ffb8e41)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.64

## 1.0.0-rc.72

### Patch Changes

- Updated dependencies [[`3392631`](https://github.com/thorswap/SwapKit/commit/3392631d937015b192f2a308d045208930963984)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.63
  - @swapkit/helpers@1.0.0-rc.59
  - @swapkit/toolbox-evm@1.0.0-rc.63
  - @swapkit/toolbox-utxo@1.0.0-rc.62

## 1.0.0-rc.71

### Patch Changes

- Updated dependencies [[`2b02477`](https://github.com/thorswap/SwapKit/commit/2b02477fb02bd1c29c972d517fd86da1034ff3e5)]:
  - @swapkit/helpers@1.0.0-rc.58
  - @swapkit/toolbox-cosmos@1.0.0-rc.62
  - @swapkit/toolbox-evm@1.0.0-rc.62
  - @swapkit/toolbox-utxo@1.0.0-rc.61

## 1.0.0-rc.70

### Patch Changes

- Updated dependencies [[`5a27d90`](https://github.com/thorswap/SwapKit/commit/5a27d9045ac8da1c015cf9b891253fc6f73bfed0)]:
  - @swapkit/helpers@1.0.0-rc.57
  - @swapkit/toolbox-cosmos@1.0.0-rc.61
  - @swapkit/toolbox-evm@1.0.0-rc.61
  - @swapkit/toolbox-utxo@1.0.0-rc.60

## 1.0.0-rc.69

### Patch Changes

- [`16ebec6`](https://github.com/thorswap/SwapKit/commit/16ebec6d5cbba777880ba24542f93a6a808c55a1) Thanks [@chillios-dev](https://github.com/chillios-dev)! - bump

- Updated dependencies [[`16ebec6`](https://github.com/thorswap/SwapKit/commit/16ebec6d5cbba777880ba24542f93a6a808c55a1)]:
  - @swapkit/helpers@1.0.0-rc.56
  - @swapkit/toolbox-cosmos@1.0.0-rc.60
  - @swapkit/toolbox-utxo@1.0.0-rc.59
  - @swapkit/types@1.0.0-rc.31
  - @swapkit/toolbox-evm@1.0.0-rc.60

## 1.0.0-rc.68

### Patch Changes

- bump

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.59
  - @swapkit/helpers@1.0.0-rc.55
  - @swapkit/toolbox-utxo@1.0.0-rc.58
  - @swapkit/types@1.0.0-rc.30
  - @swapkit/toolbox-evm@1.0.0-rc.59

## 1.0.0-rc.67

### Patch Changes

- Updated dependencies [[`ba06185`](https://github.com/thorswap/SwapKit/commit/ba061858f0975717e16ddd743076839bbce5f616)]:
  - @swapkit/types@1.0.0-rc.29
  - @swapkit/helpers@1.0.0-rc.54
  - @swapkit/toolbox-cosmos@1.0.0-rc.58
  - @swapkit/toolbox-evm@1.0.0-rc.58
  - @swapkit/toolbox-utxo@1.0.0-rc.57

## 1.0.0-rc.66

### Patch Changes

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.53
  - @swapkit/toolbox-cosmos@1.0.0-rc.57
  - @swapkit/toolbox-evm@1.0.0-rc.57
  - @swapkit/toolbox-utxo@1.0.0-rc.56

## 1.0.0-rc.65

### Patch Changes

- Updated dependencies [[`34e31a4`](https://github.com/thorswap/SwapKit/commit/34e31a4647c9b460b8e0ad4850fcc73043c22436)]:
  - @swapkit/helpers@1.0.0-rc.52
  - @swapkit/toolbox-evm@1.0.0-rc.56
  - @swapkit/toolbox-cosmos@1.0.0-rc.56
  - @swapkit/toolbox-utxo@1.0.0-rc.55

## 1.0.0-rc.64

### Patch Changes

- Updated dependencies [[`180c4a4`](https://github.com/thorswap/SwapKit/commit/180c4a4c9d5443feec25199383800407c93bb30e)]:
  - @swapkit/types@1.0.0-rc.28
  - @swapkit/toolbox-evm@1.0.0-rc.55
  - @swapkit/helpers@1.0.0-rc.51
  - @swapkit/toolbox-cosmos@1.0.0-rc.55
  - @swapkit/toolbox-utxo@1.0.0-rc.54

## 1.0.0-rc.63

### Patch Changes

- [#473](https://github.com/thorswap/SwapKit/pull/473) [`0864ab0`](https://github.com/thorswap/SwapKit/commit/0864ab0201cdd55ad82f27f042e38fc27d623393) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Update imports

- bump packages

- Updated dependencies [[`0864ab0`](https://github.com/thorswap/SwapKit/commit/0864ab0201cdd55ad82f27f042e38fc27d623393)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.54
  - @swapkit/helpers@1.0.0-rc.50
  - @swapkit/toolbox-utxo@1.0.0-rc.53
  - @swapkit/types@1.0.0-rc.27
  - @swapkit/toolbox-evm@1.0.0-rc.54

## 1.0.0-rc.62

### Patch Changes

- tokenlist bump[

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.53
  - @swapkit/helpers@1.0.0-rc.49
  - @swapkit/toolbox-utxo@1.0.0-rc.52
  - @swapkit/types@1.0.0-rc.26
  - @swapkit/toolbox-evm@1.0.0-rc.53

## 1.0.0-rc.61

### Patch Changes

- Updated dependencies [[`7ea8b2c`](https://github.com/thorswap/SwapKit/commit/7ea8b2cf5f2e9a6cedf8708c4222094ebb6513dd)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.52

## 1.0.0-rc.60

### Patch Changes

- Updated dependencies [[`d2c8730`](https://github.com/thorswap/SwapKit/commit/d2c873099e7a519f4ccbb104b68acbf1f0897dcf)]:
  - @swapkit/toolbox-evm@1.0.0-rc.52

## 1.0.0-rc.59

### Patch Changes

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.48
  - @swapkit/toolbox-cosmos@1.0.0-rc.51
  - @swapkit/toolbox-evm@1.0.0-rc.51
  - @swapkit/toolbox-utxo@1.0.0-rc.51

## 1.0.0-rc.58

### Patch Changes

- Updated dependencies [[`2311aa93`](https://github.com/thorswap/SwapKit/commit/2311aa9303e3b50fa2f0c0f75872c6553caf0293)]:
  - @swapkit/toolbox-evm@1.0.0-rc.50

## 1.0.0-rc.57

### Patch Changes

- [#439](https://github.com/thorswap/SwapKit/pull/439) [`853c3e79`](https://github.com/thorswap/SwapKit/commit/853c3e79d6e80c05cabedbea97c17f00db4b74b2) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Use Thorchain tokenlist only

- Updated dependencies [[`853c3e79`](https://github.com/thorswap/SwapKit/commit/853c3e79d6e80c05cabedbea97c17f00db4b74b2)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.50
  - @swapkit/helpers@1.0.0-rc.47
  - @swapkit/toolbox-utxo@1.0.0-rc.50
  - @swapkit/types@1.0.0-rc.25
  - @swapkit/toolbox-evm@1.0.0-rc.49

## 1.0.0-rc.56

### Patch Changes

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.46
  - @swapkit/toolbox-cosmos@1.0.0-rc.49
  - @swapkit/toolbox-evm@1.0.0-rc.48
  - @swapkit/toolbox-utxo@1.0.0-rc.49

## 1.0.0-rc.55

### Patch Changes

- Patch for @ledgerhq/live-network

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.48
  - @swapkit/helpers@1.0.0-rc.45
  - @swapkit/toolbox-utxo@1.0.0-rc.48
  - @swapkit/types@1.0.0-rc.24
  - @swapkit/toolbox-evm@1.0.0-rc.47

## 1.0.0-rc.54

### Patch Changes

- Updated dependencies [[`49d477a9`](https://github.com/thorswap/SwapKit/commit/49d477a9b01a97f861352cd6e15743e874b98170)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.47

## 1.0.0-rc.53

### Patch Changes

- Bump to sk links

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.46
  - @swapkit/helpers@1.0.0-rc.44
  - @swapkit/toolbox-utxo@1.0.0-rc.47
  - @swapkit/types@1.0.0-rc.23
  - @swapkit/toolbox-evm@1.0.0-rc.46

## 1.0.0-rc.52

### Patch Changes

- Updated dependencies [[`76ca073d`](https://github.com/thorswap/SwapKit/commit/76ca073dd9e57217b08a4b82cc821b8b75bd3120)]:
  - @swapkit/helpers@1.0.0-rc.43
  - @swapkit/toolbox-cosmos@1.0.0-rc.45
  - @swapkit/toolbox-evm@1.0.0-rc.45
  - @swapkit/toolbox-utxo@1.0.0-rc.46

## 1.0.0-rc.51

### Patch Changes

- Updated dependencies [[`42b301ed`](https://github.com/thorswap/SwapKit/commit/42b301ed664bc9b828cdf16ef70c47963eaa31fa)]:
  - @swapkit/toolbox-utxo@1.0.0-rc.45

## 1.0.0-rc.50

### Patch Changes

- Update addLiquidityPart for symmetrics

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.44
  - @swapkit/helpers@1.0.0-rc.42
  - @swapkit/toolbox-utxo@1.0.0-rc.44
  - @swapkit/types@1.0.0-rc.22
  - @swapkit/toolbox-evm@1.0.0-rc.44

## 1.0.0-rc.49

### Patch Changes

- Bump for explorer & synths

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.43
  - @swapkit/helpers@1.0.0-rc.41
  - @swapkit/toolbox-utxo@1.0.0-rc.43
  - @swapkit/types@1.0.0-rc.21
  - @swapkit/toolbox-evm@1.0.0-rc.43

## 1.0.0-rc.48

### Patch Changes

- Bump

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.42
  - @swapkit/helpers@1.0.0-rc.40
  - @swapkit/toolbox-utxo@1.0.0-rc.42
  - @swapkit/types@1.0.0-rc.20
  - @swapkit/toolbox-evm@1.0.0-rc.42

## 1.0.0-rc.47

### Patch Changes

- tests

- toUrl

- [`9af9e284`](https://github.com/thorswap/SwapKit/commit/9af9e2845126818d4dace38457e219fffa1b3a8c) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Update toString on synths

- Updated dependencies [[`9af9e284`](https://github.com/thorswap/SwapKit/commit/9af9e2845126818d4dace38457e219fffa1b3a8c)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.41
  - @swapkit/helpers@1.0.0-rc.39
  - @swapkit/toolbox-utxo@1.0.0-rc.41
  - @swapkit/types@1.0.0-rc.19
  - @swapkit/toolbox-evm@1.0.0-rc.41

## 1.0.0-rc.46

### Patch Changes

- Patch typeforce

- Updated dependencies [[`7d25148f`](https://github.com/thorswap/SwapKit/commit/7d25148f0ffcbb430690f9cf53c2e711a8385620)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.40
  - @swapkit/toolbox-utxo@1.0.0-rc.40
  - @swapkit/helpers@1.0.0-rc.38
  - @swapkit/types@1.0.0-rc.18
  - @swapkit/toolbox-evm@1.0.0-rc.40

## 1.0.0-rc.45

### Patch Changes

- Updated dependencies [[`76ef0067`](https://github.com/thorswap/SwapKit/commit/76ef00670da6505e3b7e1602d76ae6abcbaaf141), [`ee70c6e3`](https://github.com/thorswap/SwapKit/commit/ee70c6e3ce0fe74897227b415adae47b3b590c93)]:
  - @swapkit/helpers@1.0.0-rc.37
  - @swapkit/toolbox-cosmos@1.0.0-rc.39
  - @swapkit/toolbox-evm@1.0.0-rc.39
  - @swapkit/toolbox-utxo@1.0.0-rc.39

## 1.0.0-rc.44

### Patch Changes

- [#414](https://github.com/thorswap/SwapKit/pull/414) [`2c3f649f`](https://github.com/thorswap/SwapKit/commit/2c3f649fdebb5463e51c2929d6b3091852a59e9c) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Fix Division precision

- Updated dependencies [[`2c3f649f`](https://github.com/thorswap/SwapKit/commit/2c3f649fdebb5463e51c2929d6b3091852a59e9c)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.38
  - @swapkit/helpers@1.0.0-rc.36
  - @swapkit/toolbox-utxo@1.0.0-rc.38
  - @swapkit/types@1.0.0-rc.17
  - @swapkit/toolbox-evm@1.0.0-rc.38

## 1.0.0-rc.43

### Patch Changes

- Update dependencies with crypto-js 4.2.0

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.37
  - @swapkit/helpers@1.0.0-rc.35
  - @swapkit/toolbox-utxo@1.0.0-rc.37
  - @swapkit/types@1.0.0-rc.16
  - @swapkit/toolbox-evm@1.0.0-rc.37

## 1.0.0-rc.42

### Patch Changes

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.34
  - @swapkit/toolbox-cosmos@1.0.0-rc.36
  - @swapkit/toolbox-evm@1.0.0-rc.36
  - @swapkit/toolbox-utxo@1.0.0-rc.36

## 1.0.0-rc.41

### Patch Changes

- Testout publish

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.35
  - @swapkit/helpers@1.0.0-rc.33
  - @swapkit/toolbox-utxo@1.0.0-rc.35
  - @swapkit/types@1.0.0-rc.15
  - @swapkit/toolbox-evm@1.0.0-rc.35

## 1.0.0-rc.40

### Patch Changes

- Update package name generation

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.34
  - @swapkit/helpers@1.0.0-rc.32
  - @swapkit/toolbox-utxo@1.0.0-rc.34
  - @swapkit/types@1.0.0-rc.14
  - @swapkit/toolbox-evm@1.0.0-rc.34

## 1.0.0-rc.39

### Patch Changes

- [#404](https://github.com/thorswap/SwapKit/pull/404) [`af8ed16f`](https://github.com/thorswap/SwapKit/commit/af8ed16f77d15570f99a6062b7ba81273ff84b29) Thanks [@chillios-ts](https://github.com/chillios-ts)! - New chains support for evm/cosmos wallets

- Updated dependencies [[`af8ed16f`](https://github.com/thorswap/SwapKit/commit/af8ed16f77d15570f99a6062b7ba81273ff84b29)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.33
  - @swapkit/helpers@1.0.0-rc.31
  - @swapkit/toolbox-utxo@1.0.0-rc.33
  - @swapkit/types@1.0.0-rc.13
  - @swapkit/toolbox-evm@1.0.0-rc.33

## 1.0.0-rc.38

### Patch Changes

- bump packages

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.32
  - @swapkit/helpers@1.0.0-rc.30
  - @swapkit/toolbox-utxo@1.0.0-rc.32
  - @swapkit/types@1.0.0-rc.12
  - @swapkit/toolbox-evm@1.0.0-rc.32

## 1.0.0-rc.37

### Patch Changes

- addLiquidityPart and fix toCurrency

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.31
  - @swapkit/helpers@1.0.0-rc.29
  - @swapkit/toolbox-utxo@1.0.0-rc.31
  - @swapkit/types@1.0.0-rc.11
  - @swapkit/toolbox-evm@1.0.0-rc.31

## 1.0.0-rc.36

### Patch Changes

- Updated dependencies [[`472dec44`](https://github.com/thorswap/SwapKit/commit/472dec4458866c426cc2a462a157de1e3c886265)]:
  - @swapkit/toolbox-utxo@1.0.0-rc.30

## 1.0.0-rc.35

### Patch Changes

- remove cache asset

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.30
  - @swapkit/helpers@1.0.0-rc.28
  - @swapkit/toolbox-utxo@1.0.0-rc.29
  - @swapkit/types@1.0.0-rc.10
  - @swapkit/toolbox-evm@1.0.0-rc.30

## 1.0.0-rc.34

### Patch Changes

- Performance rebuild for helpers

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.29
  - @swapkit/helpers@1.0.0-rc.27
  - @swapkit/toolbox-utxo@1.0.0-rc.28
  - @swapkit/toolbox-evm@1.0.0-rc.29
  - @swapkit/types@1.0.0-rc.9

## 1.0.0-rc.33

### Patch Changes

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.26
  - @swapkit/toolbox-cosmos@1.0.0-rc.28
  - @swapkit/toolbox-evm@1.0.0-rc.28
  - @swapkit/toolbox-utxo@1.0.0-rc.27

## 1.0.0-rc.32

### Patch Changes

- perf improvements'

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.27
  - @swapkit/helpers@1.0.0-rc.25
  - @swapkit/toolbox-utxo@1.0.0-rc.26
  - @swapkit/toolbox-evm@1.0.0-rc.27

## 1.0.0-rc.31

### Patch Changes

- Perf improvement on initialization of AssetValue

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.26
  - @swapkit/helpers@1.0.0-rc.24
  - @swapkit/toolbox-utxo@1.0.0-rc.25
  - @swapkit/toolbox-evm@1.0.0-rc.26

## 1.0.0-rc.30

### Patch Changes

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.23
  - @swapkit/toolbox-evm@1.0.0-rc.25
  - @swapkit/toolbox-cosmos@1.0.0-rc.25
  - @swapkit/toolbox-utxo@1.0.0-rc.24

## 1.0.0-rc.29

### Patch Changes

- Updated dependencies [[`cb826840`](https://github.com/thorswap/SwapKit/commit/cb826840613b7b8b1b677225689fd3daec4a941c)]:
  - @swapkit/helpers@1.0.0-rc.22
  - @swapkit/toolbox-cosmos@1.0.0-rc.24
  - @swapkit/toolbox-evm@1.0.0-rc.24
  - @swapkit/toolbox-utxo@1.0.0-rc.23

## 1.0.0-rc.28

### Patch Changes

- Bump all for types

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.23
  - @swapkit/helpers@1.0.0-rc.21
  - @swapkit/toolbox-utxo@1.0.0-rc.22
  - @swapkit/types@1.0.0-rc.8
  - @swapkit/toolbox-evm@1.0.0-rc.23

## 1.0.0-rc.27

### Patch Changes

- Updated dependencies [[`bd0e5c21`](https://github.com/thorswap/SwapKit/commit/bd0e5c21f03b3da664851dbffd7af32302375d98), [`6e1bcdb5`](https://github.com/thorswap/SwapKit/commit/6e1bcdb5b913f2c3ec2a00662141b7489c15c4f4)]:
  - @swapkit/toolbox-evm@1.0.0-rc.22

## 1.0.0-rc.26

### Patch Changes

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.19
  - @swapkit/toolbox-evm@1.0.0-rc.21
  - @swapkit/toolbox-cosmos@1.0.0-rc.21
  - @swapkit/toolbox-utxo@1.0.0-rc.20

## 1.0.0-rc.25

### Patch Changes

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.18
  - @swapkit/toolbox-cosmos@1.0.0-rc.20
  - @swapkit/toolbox-evm@1.0.0-rc.20
  - @swapkit/toolbox-utxo@1.0.0-rc.19

## 1.0.0-rc.24

### Patch Changes

- Updated dependencies [[`36141064`](https://github.com/thorswap/SwapKit/commit/36141064b9fecc4e48b9d6ceb68e479e56370132)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.19
  - @swapkit/helpers@1.0.0-rc.17
  - @swapkit/toolbox-utxo@1.0.0-rc.18
  - @swapkit/toolbox-evm@1.0.0-rc.19

## 1.0.0-rc.23

### Patch Changes

- Updated dependencies [[`180f4866`](https://github.com/thorswap/SwapKit/commit/180f4866d444d757985c7f0705ce1c339cac598e)]:
  - @swapkit/toolbox-evm@1.0.0-rc.18

## 1.0.0-rc.22

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.18
  - @swapkit/helpers@1.0.0-rc.16
  - @swapkit/types@1.0.0-rc.7
  - @swapkit/toolbox-evm@1.0.0-rc.17
  - @swapkit/toolbox-utxo@1.0.0-rc.17

## 1.0.0-rc.21

### Patch Changes

- Updated dependencies [[`c66eedd`](https://github.com/thorswap/SwapKit/commit/c66eedd4f950ed9bc8107af39a2c9bf68253c18d)]:
  - @swapkit/helpers@1.0.0-rc.15
  - @swapkit/toolbox-cosmos@1.0.0-rc.17
  - @swapkit/toolbox-evm@1.0.0-rc.16
  - @swapkit/toolbox-utxo@1.0.0-rc.16

## 1.0.0-rc.20

### Patch Changes

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.14
  - @swapkit/toolbox-cosmos@1.0.0-rc.16
  - @swapkit/toolbox-evm@1.0.0-rc.15
  - @swapkit/toolbox-utxo@1.0.0-rc.15

## 1.0.0-rc.19

### Patch Changes

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.13
  - @swapkit/toolbox-cosmos@1.0.0-rc.15
  - @swapkit/toolbox-evm@1.0.0-rc.14
  - @swapkit/toolbox-utxo@1.0.0-rc.14

## 1.0.0-rc.18

### Patch Changes

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.12
  - @swapkit/toolbox-cosmos@1.0.0-rc.14
  - @swapkit/toolbox-evm@1.0.0-rc.13
  - @swapkit/toolbox-utxo@1.0.0-rc.13

## 1.0.0-rc.17

### Patch Changes

- Updated dependencies [[`e4f97a9`](https://github.com/thorswap/SwapKit/commit/e4f97a9f50827c6eb4089ef63c2ad81c95014a82)]:
  - @swapkit/helpers@1.0.0-rc.11
  - @swapkit/toolbox-cosmos@1.0.0-rc.13
  - @swapkit/toolbox-evm@1.0.0-rc.12
  - @swapkit/toolbox-utxo@1.0.0-rc.12

## 1.0.0-rc.16

### Patch Changes

- Updated dependencies [[`1550fe6`](https://github.com/thorswap/SwapKit/commit/1550fe6477bc7e4b42e4cd6c57ed4e2df722c7af)]:
  - @swapkit/helpers@1.0.0-rc.10
  - @swapkit/toolbox-cosmos@1.0.0-rc.12
  - @swapkit/toolbox-evm@1.0.0-rc.11
  - @swapkit/toolbox-utxo@1.0.0-rc.11

## 1.0.0-rc.15

### Patch Changes

- [`2c7f246`](https://github.com/thorswap/SwapKit/commit/2c7f2467b43686fb3665e8899383705f435af85f) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Bump fetch wraper

- Updated dependencies [[`2c7f246`](https://github.com/thorswap/SwapKit/commit/2c7f2467b43686fb3665e8899383705f435af85f)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.11
  - @swapkit/helpers@1.0.0-rc.9
  - @swapkit/toolbox-utxo@1.0.0-rc.10
  - @swapkit/types@1.0.0-rc.6
  - @swapkit/toolbox-evm@1.0.0-rc.10

## 1.0.0-rc.14

### Patch Changes

- Updated dependencies [[`9d5ffa4`](https://github.com/thorswap/SwapKit/commit/9d5ffa44619b41419e7fb51034b21e24a96e5411), [`9d5ffa4`](https://github.com/thorswap/SwapKit/commit/9d5ffa44619b41419e7fb51034b21e24a96e5411)]:
  - @swapkit/helpers@1.0.0-rc.8
  - @swapkit/toolbox-evm@1.0.0-rc.9
  - @swapkit/toolbox-utxo@1.0.0-rc.9
  - @swapkit/toolbox-cosmos@1.0.0-rc.10

## 1.0.0-rc.13

### Patch Changes

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.7
  - @swapkit/toolbox-cosmos@1.0.0-rc.9
  - @swapkit/toolbox-evm@1.0.0-rc.8
  - @swapkit/toolbox-utxo@1.0.0-rc.8

## 1.0.0-rc.12

### Patch Changes

- add scam filter for balances

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.8
  - @swapkit/helpers@1.0.0-rc.6
  - @swapkit/toolbox-utxo@1.0.0-rc.7
  - @swapkit/types@1.0.0-rc.5
  - @swapkit/toolbox-evm@1.0.0-rc.7

## 1.0.0-rc.11

### Patch Changes

- Fix cache

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.7
  - @swapkit/helpers@1.0.0-rc.5
  - @swapkit/toolbox-utxo@1.0.0-rc.6
  - @swapkit/types@1.0.0-rc.4
  - @swapkit/toolbox-evm@1.0.0-rc.6

## 1.0.0-rc.10

### Patch Changes

- bump for keystore update

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.6
  - @swapkit/helpers@1.0.0-rc.4
  - @swapkit/toolbox-utxo@1.0.0-rc.5
  - @swapkit/types@1.0.0-rc.3
  - @swapkit/toolbox-evm@1.0.0-rc.5

## 1.0.0-rc.9

### Patch Changes

- [`4ad62d8`](https://github.com/thorswap/SwapKit/commit/4ad62d82fb9f236753a2a2ee0c17cd3a8d57f23a) Thanks [@chillios-ts](https://github.com/chillios-ts)! - fix rpc connection

- Updated dependencies [[`4ad62d8`](https://github.com/thorswap/SwapKit/commit/4ad62d82fb9f236753a2a2ee0c17cd3a8d57f23a)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.5
  - @swapkit/helpers@1.0.0-rc.3
  - @swapkit/toolbox-utxo@1.0.0-rc.4
  - @swapkit/types@1.0.0-rc.2
  - @swapkit/toolbox-evm@1.0.0-rc.4

## 1.0.0-rc.8

### Patch Changes

- [#363](https://github.com/thorswap/SwapKit/pull/363) [`0e1d996`](https://github.com/thorswap/SwapKit/commit/0e1d99672a809f8e9017241930d3f1ce9ff6fc11) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Fix nodejs environment

- Updated dependencies [[`0e1d996`](https://github.com/thorswap/SwapKit/commit/0e1d99672a809f8e9017241930d3f1ce9ff6fc11), [`0e1d996`](https://github.com/thorswap/SwapKit/commit/0e1d99672a809f8e9017241930d3f1ce9ff6fc11)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.4
  - @swapkit/helpers@1.0.0-rc.2
  - @swapkit/toolbox-utxo@1.0.0-rc.3
  - @swapkit/types@1.0.0-rc.1
  - @swapkit/toolbox-evm@1.0.0-rc.3

## 1.0.0-rc.7

### Patch Changes

- Updated dependencies [[`7f73203`](https://github.com/thorswap/SwapKit/commit/7f7320316051a25d7acd9733700560f3f9619500)]:
  - @swapkit/toolbox-cosmos@1.0.0-rc.3

## 1.0.0-rc.6

### Patch Changes

- Bump typings

## 1.0.0-rc.5

### Patch Changes

- Update keystore for crypto import

## 1.0.0-rc.4

### Patch Changes

- Updated dependencies [[`9dc813b`](https://github.com/thorswap/SwapKit/commit/9dc813bfad78bd8841b02fade2f96d110a1219a7)]:
  - @swapkit/toolbox-utxo@1.0.0-rc.2

## 1.0.0-rc.3

### Patch Changes

- Updated dependencies [[`46830d7`](https://github.com/thorswap/SwapKit/commit/46830d7fe2f164f25466afd5d7c768022e8443bd)]:
  - @swapkit/helpers@1.0.0-rc.1
  - @swapkit/toolbox-cosmos@1.0.0-rc.2
  - @swapkit/toolbox-evm@1.0.0-rc.2
  - @swapkit/toolbox-utxo@1.0.0-rc.1

## 1.0.0-rc.2

### Patch Changes

- Updated dependencies [[`96ccc78`](https://github.com/thorswap/SwapKit/commit/96ccc7869bd4c6bb99e0ba0a3863d08a08c2fdcd)]:
  - @swapkit/toolbox-evm@1.0.0-rc.1

## 1.0.0-rc.1

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-cosmos@1.0.0-rc.1
