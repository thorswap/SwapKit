# @swapkit/wallet-evm-extensions

## 1.0.0-rc.90

### Patch Changes

- [`c046683`](https://github.com/thorswap/SwapKit/commit/c04668374869bffb3dbe5130e2136d158f592678) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Bump for latest

- Updated dependencies [[`c046683`](https://github.com/thorswap/SwapKit/commit/c04668374869bffb3dbe5130e2136d158f592678)]:
  - @swapkit/helpers@1.0.0-rc.82
  - @swapkit/types@1.0.0-rc.47
  - @swapkit/toolbox-evm@1.0.0-rc.88

## 1.0.0-rc.89

### Patch Changes

- Bump for latest

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.81
  - @swapkit/types@1.0.0-rc.46
  - @swapkit/toolbox-evm@1.0.0-rc.87

## 1.0.0-rc.88

### Patch Changes

- [#677](https://github.com/thorswap/SwapKit/pull/677) [`5a59dc1`](https://github.com/thorswap/SwapKit/commit/5a59dc1fd8a46cb197e6d33ac5a0d9b5a2591d30) Thanks [@chillios-dev](https://github.com/chillios-dev)! - bump for all with ledger'

- Updated dependencies [[`5a59dc1`](https://github.com/thorswap/SwapKit/commit/5a59dc1fd8a46cb197e6d33ac5a0d9b5a2591d30)]:
  - @swapkit/helpers@1.0.0-rc.80
  - @swapkit/types@1.0.0-rc.45
  - @swapkit/toolbox-evm@1.0.0-rc.86

## 1.0.0-rc.87

### Patch Changes

- Updated dependencies [[`ee359df`](https://github.com/thorswap/SwapKit/commit/ee359df9c984ea984c0dcb0f58b94ba6037608b6)]:
  - @swapkit/helpers@1.0.0-rc.79
  - @swapkit/toolbox-evm@1.0.0-rc.85

## 1.0.0-rc.86

### Patch Changes

- Bump for latest

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.78
  - @swapkit/types@1.0.0-rc.44
  - @swapkit/toolbox-evm@1.0.0-rc.84

## 1.0.0-rc.85

### Patch Changes

- Bump for latest

- Updated dependencies []:
  - @swapkit/helpers@1.0.0-rc.77
  - @swapkit/types@1.0.0-rc.43
  - @swapkit/toolbox-evm@1.0.0-rc.83

## 1.0.0-rc.84

### Patch Changes

- [`6a72433`](https://github.com/thorswap/SwapKit/commit/6a7243378dbe2a75451930759c50d0a5799c1522) Thanks [@chillios-dev](https://github.com/chillios-dev)! - bump deps

- Updated dependencies [[`6a72433`](https://github.com/thorswap/SwapKit/commit/6a7243378dbe2a75451930759c50d0a5799c1522)]:
  - @swapkit/helpers@1.0.0-rc.76
  - @swapkit/types@1.0.0-rc.42
  - @swapkit/toolbox-evm@1.0.0-rc.82

## 1.0.0-rc.83

### Patch Changes

- [`f85416f`](https://github.com/thorswap/SwapKit/commit/f85416fe52f979f7ca9da286e72ab1a691f9d92a) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Bump packages with sdk

- Updated dependencies [[`f85416f`](https://github.com/thorswap/SwapKit/commit/f85416fe52f979f7ca9da286e72ab1a691f9d92a)]:
  - @swapkit/helpers@1.0.0-rc.75
  - @swapkit/types@1.0.0-rc.41
  - @swapkit/toolbox-evm@1.0.0-rc.81

## 1.0.0-rc.82

### Patch Changes

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.40
  - @swapkit/helpers@1.0.0-rc.74
  - @swapkit/toolbox-evm@1.0.0-rc.80

## 1.0.0-rc.81

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
  - @swapkit/helpers@1.0.0-rc.73
  - @swapkit/types@1.0.0-rc.39
  - @swapkit/toolbox-evm@1.0.0-rc.79

## 1.0.0-rc.80

### Patch Changes

- Update toolboxes for using proper address'

- [`ae90588`](https://github.com/thorswap/SwapKit/commit/ae90588732b6b71b4a2ea91d0bb83b7c0aca702c) Thanks [@towanTG](https://github.com/towanTG)! - Adds core plugin support for swap provider

- Updated dependencies [[`ae90588`](https://github.com/thorswap/SwapKit/commit/ae90588732b6b71b4a2ea91d0bb83b7c0aca702c)]:
  - @swapkit/helpers@1.0.0-rc.72
  - @swapkit/types@1.0.0-rc.38
  - @swapkit/toolbox-evm@1.0.0-rc.78

## 1.0.0-rc.79

### Patch Changes

- Updated dependencies [[`ec7f912`](https://github.com/thorswap/SwapKit/commit/ec7f9120cf2d82c66eaa4936312a6c56cfef68bf)]:
  - @swapkit/helpers@1.0.0-rc.71
  - @swapkit/toolbox-evm@1.0.0-rc.77

## 1.0.0-rc.78

### Patch Changes

- Updated dependencies [[`16f5b57`](https://github.com/thorswap/SwapKit/commit/16f5b570290df1339be9f140a19a6c831a2a875e)]:
  - @swapkit/helpers@1.0.0-rc.70
  - @swapkit/toolbox-evm@1.0.0-rc.76

## 1.0.0-rc.77

### Patch Changes

- Updated dependencies [[`173dbf7`](https://github.com/thorswap/SwapKit/commit/173dbf773d0ee77b96afa62fd8e66296c3a935fb)]:
  - @swapkit/helpers@1.0.0-rc.69
  - @swapkit/types@1.0.0-rc.37
  - @swapkit/toolbox-evm@1.0.0-rc.75

## 1.0.0-rc.76

### Patch Changes

- Updated dependencies [[`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4), [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4), [`a3b89c2`](https://github.com/thorswap/SwapKit/commit/a3b89c263b89ae267fed1ca48e6da01f7dba8fd4)]:
  - @swapkit/helpers@1.0.0-rc.68
  - @swapkit/types@1.0.0-rc.36
  - @swapkit/toolbox-evm@1.0.0-rc.74

## 1.0.0-rc.75

### Patch Changes

- Updated dependencies [[`87dfbe6`](https://github.com/thorswap/SwapKit/commit/87dfbe643ca25501204213f44380467e1adfcb14)]:
  - @swapkit/types@1.0.0-rc.35
  - @swapkit/helpers@1.0.0-rc.67
  - @swapkit/toolbox-evm@1.0.0-rc.73

## 1.0.0-rc.74

### Patch Changes

- Updated dependencies [[`692e678`](https://github.com/thorswap/SwapKit/commit/692e678dbad40165c133ba4d2db2d97f5dd22283)]:
  - @swapkit/helpers@1.0.0-rc.66
  - @swapkit/toolbox-evm@1.0.0-rc.72

## 1.0.0-rc.73

### Patch Changes

- Updated dependencies [[`3b7af80`](https://github.com/thorswap/SwapKit/commit/3b7af8085ecc7e279dbd639b3375a81cc740970a)]:
  - @swapkit/helpers@1.0.0-rc.65
  - @swapkit/types@1.0.0-rc.34
  - @swapkit/toolbox-evm@1.0.0-rc.71

## 1.0.0-rc.72

### Patch Changes

- [#560](https://github.com/thorswap/SwapKit/pull/560) [`93adbb8`](https://github.com/thorswap/SwapKit/commit/93adbb8eb39ea5ff94b5be692f81ca55abb52173) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Add api key header with config

- Updated dependencies [[`93adbb8`](https://github.com/thorswap/SwapKit/commit/93adbb8eb39ea5ff94b5be692f81ca55abb52173)]:
  - @swapkit/helpers@1.0.0-rc.64
  - @swapkit/types@1.0.0-rc.33
  - @swapkit/toolbox-evm@1.0.0-rc.70

## 1.0.0-rc.71

### Patch Changes

- Updated dependencies [[`692072d`](https://github.com/thorswap/SwapKit/commit/692072d94d38e35e1b22ea578a6a3ae6cf5340c0)]:
  - @swapkit/helpers@1.0.0-rc.63
  - @swapkit/toolbox-evm@1.0.0-rc.69

## 1.0.0-rc.70

### Patch Changes

- Updated dependencies [[`497ecd7`](https://github.com/thorswap/SwapKit/commit/497ecd7e42278c2057e4d53e1fff94f09cc96a58)]:
  - @swapkit/helpers@1.0.0-rc.62
  - @swapkit/toolbox-evm@1.0.0-rc.68

## 1.0.0-rc.69

### Patch Changes

- Updated dependencies [[`d264aa5`](https://github.com/thorswap/SwapKit/commit/d264aa5534e7eec80040d7d31dbee97c3a3d57fe)]:
  - @swapkit/types@1.0.0-rc.32
  - @swapkit/helpers@1.0.0-rc.61
  - @swapkit/toolbox-evm@1.0.0-rc.67

## 1.0.0-rc.68

### Patch Changes

- [#544](https://github.com/thorswap/SwapKit/pull/544) [`4e3edb9`](https://github.com/thorswap/SwapKit/commit/4e3edb9742c1607aebb0bffd453d471c60a0076e) Thanks [@towanTG](https://github.com/towanTG)! - Fixes UTXO Wrapped segwit support and EVM gas balances overwrite of api responses

- Updated dependencies [[`4e3edb9`](https://github.com/thorswap/SwapKit/commit/4e3edb9742c1607aebb0bffd453d471c60a0076e)]:
  - @swapkit/toolbox-evm@1.0.0-rc.66

## 1.0.0-rc.67

### Patch Changes

- Updated dependencies [[`09ef478`](https://github.com/thorswap/SwapKit/commit/09ef478734821fa2e16f8845b4cf6675353deaad)]:
  - @swapkit/helpers@1.0.0-rc.60
  - @swapkit/toolbox-evm@1.0.0-rc.65

## 1.0.0-rc.66

### Patch Changes

- Updated dependencies [[`bf24a16`](https://github.com/thorswap/SwapKit/commit/bf24a1667130a18e4748cb449625e33090d025a7)]:
  - @swapkit/toolbox-evm@1.0.0-rc.64

## 1.0.0-rc.65

### Patch Changes

- Updated dependencies [[`3392631`](https://github.com/thorswap/SwapKit/commit/3392631d937015b192f2a308d045208930963984)]:
  - @swapkit/helpers@1.0.0-rc.59
  - @swapkit/toolbox-evm@1.0.0-rc.63

## 1.0.0-rc.64

### Patch Changes

- Updated dependencies [[`2b02477`](https://github.com/thorswap/SwapKit/commit/2b02477fb02bd1c29c972d517fd86da1034ff3e5)]:
  - @swapkit/helpers@1.0.0-rc.58
  - @swapkit/toolbox-evm@1.0.0-rc.62

## 1.0.0-rc.63

### Patch Changes

- Updated dependencies [[`5a27d90`](https://github.com/thorswap/SwapKit/commit/5a27d9045ac8da1c015cf9b891253fc6f73bfed0)]:
  - @swapkit/helpers@1.0.0-rc.57
  - @swapkit/toolbox-evm@1.0.0-rc.61

## 1.0.0-rc.62

### Patch Changes

- [#490](https://github.com/thorswap/SwapKit/pull/490) [`92663f7`](https://github.com/thorswap/SwapKit/commit/92663f77194920d20f2a1090f773e3a2fd61e244) Thanks [@towanTG](https://github.com/towanTG)! - Fixes wallet getBalance overwrite

## 1.0.0-rc.61

### Patch Changes

- [#489](https://github.com/thorswap/SwapKit/pull/489) [`8ba16ea`](https://github.com/thorswap/SwapKit/commit/8ba16ea5964e608d702345e9cec8e1ee5f195626) Thanks [@towanTG](https://github.com/towanTG)! - Fixes OKX provider usage and evm extensions getBalance

## 1.0.0-rc.60

### Patch Changes

- [`16ebec6`](https://github.com/thorswap/SwapKit/commit/16ebec6d5cbba777880ba24542f93a6a808c55a1) Thanks [@chillios-dev](https://github.com/chillios-dev)! - bump

- Updated dependencies [[`16ebec6`](https://github.com/thorswap/SwapKit/commit/16ebec6d5cbba777880ba24542f93a6a808c55a1)]:
  - @swapkit/types@1.0.0-rc.31
  - @swapkit/toolbox-evm@1.0.0-rc.60

## 1.0.0-rc.59

### Patch Changes

- bump

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.30
  - @swapkit/toolbox-evm@1.0.0-rc.59

## 1.0.0-rc.58

### Patch Changes

- Updated dependencies [[`ba06185`](https://github.com/thorswap/SwapKit/commit/ba061858f0975717e16ddd743076839bbce5f616)]:
  - @swapkit/types@1.0.0-rc.29
  - @swapkit/toolbox-evm@1.0.0-rc.58

## 1.0.0-rc.57

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.57

## 1.0.0-rc.56

### Patch Changes

- Updated dependencies [[`34e31a4`](https://github.com/thorswap/SwapKit/commit/34e31a4647c9b460b8e0ad4850fcc73043c22436)]:
  - @swapkit/toolbox-evm@1.0.0-rc.56

## 1.0.0-rc.55

### Patch Changes

- [#479](https://github.com/thorswap/SwapKit/pull/479) [`180c4a4`](https://github.com/thorswap/SwapKit/commit/180c4a4c9d5443feec25199383800407c93bb30e) Thanks [@towanTG](https://github.com/towanTG)! - Adds OKx Mobile detection

- Updated dependencies [[`180c4a4`](https://github.com/thorswap/SwapKit/commit/180c4a4c9d5443feec25199383800407c93bb30e)]:
  - @swapkit/types@1.0.0-rc.28
  - @swapkit/toolbox-evm@1.0.0-rc.55

## 1.0.0-rc.54

### Patch Changes

- [#473](https://github.com/thorswap/SwapKit/pull/473) [`0864ab0`](https://github.com/thorswap/SwapKit/commit/0864ab0201cdd55ad82f27f042e38fc27d623393) Thanks [@chillios-dev](https://github.com/chillios-dev)! - Update imports

- bump packages

- Updated dependencies [[`0864ab0`](https://github.com/thorswap/SwapKit/commit/0864ab0201cdd55ad82f27f042e38fc27d623393)]:
  - @swapkit/types@1.0.0-rc.27
  - @swapkit/toolbox-evm@1.0.0-rc.54

## 1.0.0-rc.53

### Patch Changes

- tokenlist bump[

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.26
  - @swapkit/toolbox-evm@1.0.0-rc.53

## 1.0.0-rc.52

### Patch Changes

- Updated dependencies [[`d2c8730`](https://github.com/thorswap/SwapKit/commit/d2c873099e7a519f4ccbb104b68acbf1f0897dcf)]:
  - @swapkit/toolbox-evm@1.0.0-rc.52

## 1.0.0-rc.51

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.51

## 1.0.0-rc.50

### Patch Changes

- Updated dependencies [[`2311aa93`](https://github.com/thorswap/SwapKit/commit/2311aa9303e3b50fa2f0c0f75872c6553caf0293)]:
  - @swapkit/toolbox-evm@1.0.0-rc.50

## 1.0.0-rc.49

### Patch Changes

- [#439](https://github.com/thorswap/SwapKit/pull/439) [`853c3e79`](https://github.com/thorswap/SwapKit/commit/853c3e79d6e80c05cabedbea97c17f00db4b74b2) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Use Thorchain tokenlist only

- Updated dependencies [[`853c3e79`](https://github.com/thorswap/SwapKit/commit/853c3e79d6e80c05cabedbea97c17f00db4b74b2)]:
  - @swapkit/types@1.0.0-rc.25
  - @swapkit/toolbox-evm@1.0.0-rc.49

## 1.0.0-rc.48

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.48

## 1.0.0-rc.47

### Patch Changes

- Patch for @ledgerhq/live-network

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.24
  - @swapkit/toolbox-evm@1.0.0-rc.47

## 1.0.0-rc.46

### Patch Changes

- Bump to sk links

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.23
  - @swapkit/toolbox-evm@1.0.0-rc.46

## 1.0.0-rc.45

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.45

## 1.0.0-rc.44

### Patch Changes

- Update addLiquidityPart for symmetrics

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.22
  - @swapkit/toolbox-evm@1.0.0-rc.44

## 1.0.0-rc.43

### Patch Changes

- Bump for explorer & synths

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.21
  - @swapkit/toolbox-evm@1.0.0-rc.43

## 1.0.0-rc.42

### Patch Changes

- Bump

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.20
  - @swapkit/toolbox-evm@1.0.0-rc.42

## 1.0.0-rc.41

### Patch Changes

- tests

- toUrl

- [`9af9e284`](https://github.com/thorswap/SwapKit/commit/9af9e2845126818d4dace38457e219fffa1b3a8c) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Update toString on synths

- Updated dependencies [[`9af9e284`](https://github.com/thorswap/SwapKit/commit/9af9e2845126818d4dace38457e219fffa1b3a8c)]:
  - @swapkit/types@1.0.0-rc.19
  - @swapkit/toolbox-evm@1.0.0-rc.41

## 1.0.0-rc.40

### Patch Changes

- Patch typeforce

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.18
  - @swapkit/toolbox-evm@1.0.0-rc.40

## 1.0.0-rc.39

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.39

## 1.0.0-rc.38

### Patch Changes

- [#414](https://github.com/thorswap/SwapKit/pull/414) [`2c3f649f`](https://github.com/thorswap/SwapKit/commit/2c3f649fdebb5463e51c2929d6b3091852a59e9c) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Fix Division precision

- Updated dependencies [[`2c3f649f`](https://github.com/thorswap/SwapKit/commit/2c3f649fdebb5463e51c2929d6b3091852a59e9c)]:
  - @swapkit/types@1.0.0-rc.17
  - @swapkit/toolbox-evm@1.0.0-rc.38

## 1.0.0-rc.37

### Patch Changes

- Update dependencies with crypto-js 4.2.0

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.16
  - @swapkit/toolbox-evm@1.0.0-rc.37

## 1.0.0-rc.36

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.36

## 1.0.0-rc.35

### Patch Changes

- Testout publish

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.15
  - @swapkit/toolbox-evm@1.0.0-rc.35

## 1.0.0-rc.34

### Patch Changes

- Update package name generation

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.14
  - @swapkit/toolbox-evm@1.0.0-rc.34

## 1.0.0-rc.33

### Patch Changes

- [#404](https://github.com/thorswap/SwapKit/pull/404) [`af8ed16f`](https://github.com/thorswap/SwapKit/commit/af8ed16f77d15570f99a6062b7ba81273ff84b29) Thanks [@chillios-ts](https://github.com/chillios-ts)! - New chains support for evm/cosmos wallets

- Updated dependencies [[`af8ed16f`](https://github.com/thorswap/SwapKit/commit/af8ed16f77d15570f99a6062b7ba81273ff84b29)]:
  - @swapkit/types@1.0.0-rc.13
  - @swapkit/toolbox-evm@1.0.0-rc.33

## 1.0.0-rc.32

### Patch Changes

- bump packages

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.12
  - @swapkit/toolbox-evm@1.0.0-rc.32

## 1.0.0-rc.31

### Patch Changes

- addLiquidityPart and fix toCurrency

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.11
  - @swapkit/toolbox-evm@1.0.0-rc.31

## 1.0.0-rc.30

### Patch Changes

- remove cache asset

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.10
  - @swapkit/toolbox-evm@1.0.0-rc.30

## 1.0.0-rc.29

### Major Changes

- Performance rebuild for helpers

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.29
  - @swapkit/types@1.0.0-rc.9

## 1.0.0-rc.28

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.28

## 1.0.0-rc.27

### Patch Changes

- perf improvements'

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.27

## 1.0.0-rc.26

### Patch Changes

- Perf improvement on initialization of AssetValue

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.26

## 1.0.0-rc.25

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.25

## 1.0.0-rc.24

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.24

## 1.0.0-rc.23

### Patch Changes

- Bump all for types

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.8
  - @swapkit/toolbox-evm@1.0.0-rc.23

## 1.0.0-rc.22

### Patch Changes

- Updated dependencies [[`bd0e5c21`](https://github.com/thorswap/SwapKit/commit/bd0e5c21f03b3da664851dbffd7af32302375d98), [`6e1bcdb5`](https://github.com/thorswap/SwapKit/commit/6e1bcdb5b913f2c3ec2a00662141b7489c15c4f4)]:
  - @swapkit/toolbox-evm@1.0.0-rc.22

## 1.0.0-rc.21

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.21

## 1.0.0-rc.20

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.20

## 1.0.0-rc.19

### Patch Changes

- Updated dependencies [[`36141064`](https://github.com/thorswap/SwapKit/commit/36141064b9fecc4e48b9d6ceb68e479e56370132)]:
  - @swapkit/toolbox-evm@1.0.0-rc.19

## 1.0.0-rc.18

### Patch Changes

- Updated dependencies [[`180f4866`](https://github.com/thorswap/SwapKit/commit/180f4866d444d757985c7f0705ce1c339cac598e)]:
  - @swapkit/toolbox-evm@1.0.0-rc.18

## 1.0.0-rc.17

### Patch Changes

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.7
  - @swapkit/toolbox-evm@1.0.0-rc.17

## 1.0.0-rc.16

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.16

## 1.0.0-rc.15

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.15

## 1.0.0-rc.14

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.14

## 1.0.0-rc.13

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.13

## 1.0.0-rc.12

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.12

## 1.0.0-rc.11

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.11

## 1.0.0-rc.10

### Patch Changes

- [`2c7f246`](https://github.com/thorswap/SwapKit/commit/2c7f2467b43686fb3665e8899383705f435af85f) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Bump fetch wraper

- Updated dependencies [[`2c7f246`](https://github.com/thorswap/SwapKit/commit/2c7f2467b43686fb3665e8899383705f435af85f)]:
  - @swapkit/types@1.0.0-rc.6
  - @swapkit/toolbox-evm@1.0.0-rc.10

## 1.0.0-rc.9

### Patch Changes

- Updated dependencies [[`9d5ffa4`](https://github.com/thorswap/SwapKit/commit/9d5ffa44619b41419e7fb51034b21e24a96e5411)]:
  - @swapkit/toolbox-evm@1.0.0-rc.9

## 1.0.0-rc.8

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.8

## 1.0.0-rc.7

### Patch Changes

- add scam filter for balances

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.5
  - @swapkit/toolbox-evm@1.0.0-rc.7

## 1.0.0-rc.6

### Patch Changes

- Fix cache

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.4
  - @swapkit/toolbox-evm@1.0.0-rc.6

## 1.0.0-rc.5

### Patch Changes

- bump for keystore update

- Updated dependencies []:
  - @swapkit/types@1.0.0-rc.3
  - @swapkit/toolbox-evm@1.0.0-rc.5

## 1.0.0-rc.4

### Patch Changes

- [`4ad62d8`](https://github.com/thorswap/SwapKit/commit/4ad62d82fb9f236753a2a2ee0c17cd3a8d57f23a) Thanks [@chillios-ts](https://github.com/chillios-ts)! - fix rpc connection

- Updated dependencies [[`4ad62d8`](https://github.com/thorswap/SwapKit/commit/4ad62d82fb9f236753a2a2ee0c17cd3a8d57f23a)]:
  - @swapkit/types@1.0.0-rc.2
  - @swapkit/toolbox-evm@1.0.0-rc.4

## 1.0.0-rc.3

### Patch Changes

- [#363](https://github.com/thorswap/SwapKit/pull/363) [`0e1d996`](https://github.com/thorswap/SwapKit/commit/0e1d99672a809f8e9017241930d3f1ce9ff6fc11) Thanks [@chillios-ts](https://github.com/chillios-ts)! - Fix nodejs environment

- Updated dependencies [[`0e1d996`](https://github.com/thorswap/SwapKit/commit/0e1d99672a809f8e9017241930d3f1ce9ff6fc11)]:
  - @swapkit/types@1.0.0-rc.1
  - @swapkit/toolbox-evm@1.0.0-rc.3

## 1.0.0-rc.2

### Patch Changes

- Updated dependencies []:
  - @swapkit/toolbox-evm@1.0.0-rc.2

## 1.0.0-rc.1

### Patch Changes

- Updated dependencies [[`96ccc78`](https://github.com/thorswap/SwapKit/commit/96ccc7869bd4c6bb99e0ba0a3863d08a08c2fdcd)]:
  - @swapkit/toolbox-evm@1.0.0-rc.1
