---
description: >-
  Package with all types & enums used in package. It's exported via core & sdk
  so you don't need to install it separately
---

# @swapkit/types

### Installation

{% hint style="info" %}
Only install if you need those types directly or you don't use core/sdk package
{% endhint %}

{% tabs %}
{% tab title="pnpm" %}
```bash
pnpm add @swapkit/types
```
{% endtab %}

{% tab title="yarn" %}
```bash
yarn add @swapkit/types
```
{% endtab %}

{% tab title="npm" %}
```bash
npm add @swapkit/types
```
{% endtab %}
{% endtabs %}

### Enums

```typescript
export enum Chain {
  Arbitrum = 'ARB',
  Avalanche = 'AVAX',
  Binance = 'BNB',
  BinanceSmartChain = 'BSC',
  Bitcoin = 'BTC',
  BitcoinCash = 'BCH',
  Cosmos = 'GAIA',
  Dogecoin = 'DOGE',
  Ethereum = 'ETH',
  Litecoin = 'LTC',
  Optimism = 'OP',
  Polygon = 'MATIC',
  THORChain = 'THOR',
}

export enum DerivationPath {
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
  OP = "m/44'/60'/0'/0",
  THOR = "m/44'/931'/0'/0",
}

export const NetworkDerivationPath: Record<Chain, DerivationPathArray> = {
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
  OP: [44, 60, 0, 0, 0],
  THOR: [44, 931, 0, 0, 0],
};

export enum BaseDecimal {
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
  OP = 18,
  THOR = 8,
}

export enum ChainId {
  Arbitrum = '42161',
  ArbitrumHex = '0xa4b1',
  Avalanche = '43114',
  AvalancheHex = '0xa86a',
  Binance = 'Binance-Chain-Tigris',
  BinanceHex = '',
  BinanceSmartChain = '56',
  BinanceSmartChainHex = '0x38',
  Bitcoin = 'bitcoin',
  BitcoinHex = '',
  BitcoinCash = 'bitcoincash',
  BitcoinCashHex = '',
  Cosmos = 'cosmoshub-4',
  CosmosHex = '',
  Dogecoin = 'dogecoin',
  DogecoinHex = '',
  Ethereum = '1',
  EthereumHex = '0x1',
  Litecoin = 'litecoin',
  LitecoinHex = '',
  Optimism = '10',
  OptimismHex = '0xa',
  Polygon = '137',
  PolygonHex = '0x89',
  THORChain = 'thorchain-mainnet-v1',
  THORChainHex = '',
  THORChainStagenet = 'thorchain-stagenet-v2',
}

export enum RPCUrl {
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
  Optimism = 'https://mainnet.optimism.io',
  Polygon = 'https://polygon-rpc.com',
  THORChain = 'https://rpc.thorswap.net',
  THORChainStagenet = 'https://stagenet-rpc.ninerealms.com',
}

export enum ApiUrl {
  Cosmos = 'https://node-router.thorswap.net/cosmos/rest',
  ThornodeMainnet = 'https://thornode.thorswap.net',
  ThornodeStagenet = 'https://stagenet-thornode.ninerealms.com',
  ThorswapApi = 'https://api.thorswap.finance',
  ThorswapStatic = 'https://static.thorswap.net',
}

export enum FeeOption {
  Average = 'average',
  Fast = 'fast',
  Fastest = 'fastest',
}

export enum WalletOption {
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

### Type References

```typescript
type TODO = {}
```
