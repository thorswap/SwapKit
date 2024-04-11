---
description: >-
  Set of modules, helpers & types used in SwapKit eco-system. Implements modules
  wrapping BigInt for easier usage and precise calculations
---

# @swapkit/helpers

## **Getting started**

### **Installation**

```bash
<pnpm|bun> add @swapkit/helpers
```

## Modules

### AssetValue

Module for initialisation and handling asset operation in SwapKit and applications. It inherits from [SwapKitNumber](swapkit-helpers.md#swapkitnumber) with change on `eq` method, which gives easy way of handling operations with decimals precision taken from contract or static list

```typescript
import { AssetValue, Chain } from '@swapkit/helpers';

const btcAsset = AssetValue.fromChainOrIdentifier(Chain.Bitcoin)
const ethAsset = AssetValue.fromChainOrIdentifier(Chain.Ethereum)
const ethThorSynth = AssetValue.fromChainOrIdentifier(
    "ETH/THOR-0xa5f2211b9b8170f694421f2046281775e8468044"
)

...
```

### SwapKitNumber

Module for handling [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/BigInt) arithmetics gracefully with handling precision up to whatever decimal you need. Extends [#bigintarithmetics](swapkit-helpers.md#bigintarithmetics "mention")

```typescript
import { SwapKitNumber } from '@swapkit/helpers';

const skNumber = new SwapKitNumber("0.0000000001");
const skNumber1 = new SwapKitNumber({ value: "0.0000000001", decimal: 10 });
const skNumber2 = new SwapKitNumber({ value: 0.1005, decimal: 3 });
const skNumber3 = new SwapKitNumber({ value: -0.1005, decimal: 3 });

const numericValue = skNumber.getValue("number")
const stringValue = skNumber.getValue("string")
const bigintValue = skNumber.getValue("bigint")

const usdLikeNumber = new SwapKitNumber(1234.5678);

// "1200"
const significant2 = usdLikeNumber.toSignificant(2)
// "1234"
const significant4 = usdLikeNumber.toSignificant(4)
// "1234.56"
const significant6 = usdLikeNumber.toSignificant(6)
// "1234.5678"
const significant8 = usdLikeNumber.toSignificant(8)

const bigNumber = new SwapKitNumber(1234567890.5678);
// "1.23B"
const abbr = bigNumber.toAbbreviation()

const skNumber = new SwapKitNumber(1234.5678);
 
// "$1,234.56"
const defaultCurrency = skNumber.toCurrency();
// "1 234,56€"
const customCurrency = skNumber.toCurrency("€", {
    decimalSeparator: ",",
    thousandSeparator: " ",
    currencyPosition: "end",
  }),
)

const addedNumbers = skNumber.add(skNumber1)
const subtractedNumbers = skNumber.sub(skNumber1)
const mulNumbers = skNumber.mul(skNumber1)
const addedNumbers = skNumber.div(skNumber1)
const isGreater = skNumber.gt(skNumber1)
const isGreaterOrEqual = skNumber.gte(skNumber1)
const isLower = skNumber.lt(skNumber1)
const isLowerOrEqual = skNumber.lte(skNumber1)
const isEqual = skNumber.eq(skNumber1)
```

## Helpers

### getTHORNameCost(numberOfYears: string): number

_Returns value of RUNE needed to register thorname for X years_

***

### getMAYANameCost(numberOfYears: string): number

_Returns value of CACAO needed to register mayaname for X years_

***

### derivationPathToString(\[number, number, number, number, (number | undefined)?]): string

_Parses array of 4/5 numbers to derivation path like: `m/44'/60'/0'/0/0 | m/44'/60'/0'/0`_

***

### validateTNS(name: string): boolean

_Validates if provided name is valid for THORChain / Mayachain Name Service registration_

***

## Enums

### ApiUrl

```typescript
enum ApiUrl {
  Cosmos = 'https://node-router.thorswap.net/cosmos/rest',
  MayanodeMainnet = 'https://mayanode.mayachain.info',
  MayanodeStagenet = 'https://stagenet.mayanode.mayachain.info',
  ThornodeMainnet = 'https://thornode.thorswap.net',
  ThornodeStagenet = 'https://stagenet-thornode.ninerealms.com',
  ThorswapApi = 'https://api.thorswap.finance',
  ThorswapStatic = 'https://static.thorswap.net',
}
```

### BaseDecimal

```typescript
enum BaseDecimal {
  ARB = 18,
  AVAX = 18,
  BCH = 8,
  BNB = 8,
  BSC = 18,
  BTC = 8,
  DOGE = 8,
  ETH = 18,
  GAIA = 6,
  LTC = 8,
  MATIC = 18,
  MAYA = 10,
  OP = 18,
  THOR = 8,
}
```

### Chain

```typescript
enum Chain {
  Arbitrum = "ARB",
  Avalanche = "AVAX",
  Binance = "BNB",
  BinanceSmartChain = "BSC",
  Bitcoin = "BTC",
  BitcoinCash = "BCH",
  Cosmos = "GAIA",
  Dash = "DASH",
  Dogecoin = "DOGE",
  Ethereum = "ETH",
  Kujira = "KUJI",
  Litecoin = "LTC",
  Maya = "MAYA",
  Optimism = "OP",
  Polkadot = "DOT",
  Chainflip = "FLIP",
  Polygon = "MATIC",
  THORChain = "THOR",
}
```

### ChainId

```typescript
enum ChainId {
  Arbitrum = "42161",
  ArbitrumHex = "0xa4b1",
  Avalanche = "43114",
  AvalancheHex = "0xa86a",
  Binance = "Binance-Chain-Tigris",
  BinanceSmartChain = "56",
  BinanceSmartChainHex = "0x38",
  Bitcoin = "bitcoin",
  BitcoinCash = "bitcoincash",
  Chainflip = "chainflip",
  Cosmos = "cosmoshub-4",
  Dash = "dash",
  Dogecoin = "dogecoin",
  Kujira = "kaiyo-1",
  Ethereum = "1",
  EthereumHex = "0x1",
  Litecoin = "litecoin",
  Maya = "mayachain-mainnet-v1",
  MayaStagenet = "mayachain-stagenet-v1",
  Optimism = "10",
  OptimismHex = "0xa",
  Polkadot = "polkadot",
  Polygon = "137",
  PolygonHex = "0x89",
  THORChain = "thorchain-mainnet-v1",
  THORChainStagenet = "thorchain-stagenet-v2",
}
```

### DerivationPath

```typescript
enum DerivationPath {
  ARB = "m/44'/60'/0'/0",
  AVAX = "m/44'/60'/0'/0",
  BCH = "m/44'/145'/0'/0",
  BNB = "m/44'/714'/0'/0",
  BSC = "m/44'/60'/0'/0",
  BTC = "m/84'/0'/0'/0",
  DOGE = "m/44'/3'/0'/0",
  ETH = "m/44'/60'/0'/0",
  GAIA = "m/44'/118'/0'/0",
  LTC = "m/84'/2'/0'/0",
  MATIC = "m/44'/60'/0'/0",
  MAYA = "m/44'/931'/0'/0",
  OP = "m/44'/60'/0'/0",
  THOR = "m/44'/931'/0'/0",
}
```

### ExplorerUrl

```typescript
enum ExplorerUrl {
  Arbitrum = "https://arbiscan.io",
  Avalanche = "https://snowtrace.io",
  Binance = "https://explorer.binance.org",
  BinanceSmartChain = "https://bscscan.com",
  Bitcoin = "https://blockchair.com/bitcoin",
  BitcoinCash = "https://www.blockchair.com/bitcoin-cash",
  Chainflip = "https://explorer.polkascan.io/polkadot",
  Cosmos = "https://www.mintscan.io/cosmos",
  Dash = "https://blockchair.com/dash",
  Dogecoin = "https://blockchair.com/dogecoin",
  Ethereum = "https://etherscan.io",
  Kujira = "https://finder.kujira.network/kaiyo-1",
  Litecoin = "https://blockchair.com/litecoin",
  Maya = "https://www.mayascan.org",
  Optimism = "https://optimistic.etherscan.io",
  Polkadot = "https://polkadot.subscan.io/",
  Polygon = "https://polygonscan.com",
  THORChain = "https://runescan.io",
}

```

### FeeOption

```typescript
enum FeeOption {
  Average = 'average',
  Fast = 'fast',
  Fastest = 'fastest',
}
```

### NetworkDerivationPath

```typescript
const NetworkDerivationPath = {
  ARB: [44, 60, 0, 0, 0],
  AVAX: [44, 60, 0, 0, 0],
  BCH: [44, 145, 0, 0, 0],
  BNB: [44, 714, 0, 0, 0],
  BSC: [44, 60, 0, 0, 0],
  BTC: [84, 0, 0, 0, 0],
  DOGE: [44, 3, 0, 0, 0],
  ETH: [44, 60, 0, 0, 0],
  GAIA: [44, 118, 0, 0, 0],
  LTC: [84, 2, 0, 0, 0],
  MATIC: [44, 60, 0, 0, 0],
  MAYA: [44, 931, 0, 0, 0],
  OP: [44, 60, 0, 0, 0],
  THOR: [44, 931, 0, 0, 0],
};
```

### RPCUrl

```typescript
enum RPCUrl {
  Arbitrum = 'https://arb1.arbitrum.io/rpc',
  Avalanche = 'https://node-router.thorswap.net/avalanche-c',
  Binance = '',
  BinanceSmartChain = 'https://bsc-dataseed.binance.org',
  Bitcoin = 'https://node-router.thorswap.net/bitcoin',
  BitcoinCash = 'https://node-router.thorswap.net/bitcoin-cash',
  Cosmos = 'https://node-router.thorswap.net/cosmos/rpc',
  Dogecoin = 'https://node-router.thorswap.net/dogecoin',
  Ethereum = 'https://node-router.thorswap.net/ethereum',
  Litecoin = 'https://node-router.thorswap.net/litecoin',
  Maya = 'https://tendermint.mayachain.info',
  MayaStagenet = 'https://stagenet.tendermint.mayachain.info',
  Optimism = 'https://mainnet.optimism.io',
  Polygon = 'https://polygon-rpc.com',
  THORChain = 'https://rpc.thorswap.net',
  THORChainStagenet = 'https://stagenet-rpc.ninerealms.com',
}
```

### WalletOption

```typescript
enum WalletOption {
  'KEYSTORE' = 'KEYSTORE',
  'XDEFI' = 'XDEFI',
  'METAMASK' = 'METAMASK',
  'COINBASE_WEB' = 'COINBASE_WEB',
  'TREZOR' = 'TREZOR',
  'TRUSTWALLET_WEB' = 'TRUSTWALLET_WEB',
  'LEDGER' = 'LEDGER',
  'KEPLR' = 'KEPLR',
  'OKX' = 'OKX',
  'BRAVE' = 'BRAVE',
  'WALLETCONNECT' = 'WALLETCONNECT',
}
```

## Types

### Asset

```typescript
type Asset = {
  chain: Chain;
  symbol: string;
  ticker: string;
  synth?: boolean;
};
```

### ChainWallet

```typescript
type ChainWallet = {
  chain: Chain;
  address: string;
  balance: AssetValue[];
  walletType: WalletOption;
};
```

### CosmosChain

```typescript
type CosmosChain =
  | Chain.Cosmos
  | Chain.THORChain
  | Chain.Binance
  | Chain.Maya
  | Chain.Kujira;
```

### DerivationPath

```typescript
type DerivationPathArray = [number, number, number, number, ?number]
```

### EVMChain

```typescript
type EVMChain =
  | Chain.Ethereum
  | Chain.Avalanche
  | Chain.BinanceSmartChain
  | Chain.Arbitrum
  | Chain.Optimism
  | Chain.Polygon;
```

### GenericSwapParams

```typescript
type GenericSwapParams = {
  buyAsset: AssetValue;
  sellAsset: AssetValue;
  recipient: string;
};
```

### SubstrateChain

```typescript
type SubstrateChain = 
  | Chain.Polkadot 
  | Chain.Chainflip;
```

### UTXOChain

```typescript
type UTXOChains = 
  | Chain.Bitcoin 
  | Chain.BitcoinCash 
  | Chain.Dogecoin 
  | Chain.Litecoin;
```

### Error codes

```typescript
{
  /**
   * Core
   */
  core_wallet_connection_not_found: 10001,
  core_estimated_max_spendable_chain_not_supported: 10002,
  core_extend_error: 10003,
  core_inbound_data_not_found: 10004,
  core_approve_asset_address_or_from_not_found: 10005,
  core_plugin_not_found: 10006,
  core_plugin_swap_not_found: 10007,
  core_chain_halted: 10099,

  /**
   * Core - Wallet Connection
   */
  core_wallet_xdefi_not_installed: 10101,
  core_wallet_evmwallet_not_installed: 10102,
  core_wallet_walletconnect_not_installed: 10103,
  core_wallet_keystore_not_installed: 10104,
  core_wallet_ledger_not_installed: 10105,
  core_wallet_trezor_not_installed: 10106,
  core_wallet_keplr_not_installed: 10107,
  core_wallet_okx_not_installed: 10108,
  core_wallet_keepkey_not_installed: 10109,
  /**
   * Core - Swap
   */
  core_swap_invalid_params: 10200,
  core_swap_route_not_complete: 10201,
  core_swap_asset_not_recognized: 10202,
  core_swap_contract_not_found: 10203,
  core_swap_route_transaction_not_found: 10204,
  core_swap_contract_not_supported: 10205,
  core_swap_transaction_error: 10206,
  core_swap_quote_mode_not_supported: 10207,
  /**
   * Core - Transaction
   */
  core_transaction_deposit_error: 10301,
  core_transaction_create_liquidity_rune_error: 10302,
  core_transaction_create_liquidity_asset_error: 10303,
  core_transaction_create_liquidity_invalid_params: 10304,
  core_transaction_add_liquidity_invalid_params: 10305,
  core_transaction_add_liquidity_no_rune_address: 10306,
  core_transaction_add_liquidity_rune_error: 10307,
  core_transaction_add_liquidity_asset_error: 10308,
  core_transaction_withdraw_error: 10309,
  core_transaction_deposit_to_pool_error: 10310,
  core_transaction_deposit_insufficient_funds_error: 10311,
  core_transaction_deposit_gas_error: 10312,
  core_transaction_invalid_sender_address: 10313,
  core_transaction_deposit_server_error: 10314,
  core_transaction_user_rejected: 10315,

  /**
   * Wallets
   */
  wallet_ledger_connection_error: 20001,
  wallet_ledger_connection_claimed: 20002,
  wallet_ledger_get_address_error: 20003,
  wallet_ledger_device_not_found: 20004,
  wallet_ledger_device_locked: 20005,

  /**
   * Chainflip
   */
  chainflip_channel_error: 30001,
  chainflip_broker_recipient_error: 30002,

  /**
   * THORChain
   */

  /**
   * Helpers
   */
  helpers_number_different_decimals: 99101,
}
```
