---
description: >-
  Set of modules, helpers & types used in SwapKit eco-system. Implements modules
  wrapping BigInt for easier usage and precise calculations
---

# @swapkit/helpers

### **Installation**

```bash
<pnpm|bun> add @swapkit/helpers
```

### Usage

## Modules

#### AssetValue

Module for initialisation and handling asset operation in SwapKit and applications. It inherits from [SwapKitNumber](core-2.md#swapkitnumber) with change on `eq` method, which gives easy way of handling operations with decimals precision taken from contract or static list

```typescript
import { AssetValue } from '@swapkit/helpers';
```

#### SwapKitNumber

Module for handling [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/BigInt) arithmetics gracefully with handling precision up to whatever decimal you need

```typescript
import { SwapKitNumber } from '@swapkit/helpers';
```

#### SwapKitError

Helper error class to help with error identification. [Check Table](core-2.md#error-code-table)

```typescript
import { SwapKitError } from '@swapkit/helpers';
```

## Helpers

<table data-full-width="true"><thead><tr><th width="273.5">Method</th><th width="381">Description</th><th>Type reference</th></tr></thead><tbody><tr><td><code>derivationPathToString</code></td><td><p>Converts array derivation path to string one with recognition of short paths too (4 numbers): <br>[84, 0, 0, 0, 0] => <code>84'/0'/0'/0/0</code> </p><p>[84, 0, 0, 1] => <code>84'/0'/'0/0</code></p></td><td><pre class="language-typescript"><code class="lang-typescript">([
  network,
  chainId,
  account,
  change,
  index,
]: number[]) => string
</code></pre></td></tr><tr><td><code>getTHORNameCost</code></td><td>Returns registration fee in number to be paid in <code>RUNE</code> - Base is 10</td><td><pre class="language-typescript"><code class="lang-typescript">(year: number) => number
</code></pre></td></tr><tr><td><code>validateIdentifier</code></td><td>Validates if identifier follows <code>&#x3C;Chain>[./]&#x3C;Ticker></code> or <code>&#x3C;Chain>[./]&#x3C;Ticker>-&#x3C;ContractAddress></code> structure</td><td><pre class="language-typescript"><code class="lang-typescript">(identifier?: string) => boolean
</code></pre></td></tr></tbody></table>

### Error code table TODO

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
  core_transaction_deposit_server_error: 10313,

  /**
   * Wallets
   */
  wallet_ledger_connection_error: 20001,

  /**
   * Helpers
   */
  helpers_number_different_decimals: 99101,
}
```

## Types

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
  Maya = 'MAYA',
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
  MAYA = "m/44'/931'/0'/0",
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
  MAYA: [44, 931, 0, 0, 0],
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
  MAYA = 10,
  OP = 18,
  THOR = 8,
}

export enum ChainId {
  Arbitrum = '42161',
  ArbitrumHex = '0xa4b1',
  Avalanche = '43114',
  AvalancheHex = '0xa86a',
  Binance = 'Binance-Chain-Tigris',
  BinanceSmartChain = '56',
  BinanceSmartChainHex = '0x38',
  Bitcoin = 'bitcoin',
  BitcoinCash = 'bitcoincash',
  Cosmos = 'cosmoshub-4',
  Dogecoin = 'dogecoin',
  Ethereum = '1',
  EthereumHex = '0x1',
  Litecoin = 'litecoin',
  Maya = 'mayachain-mainnet-v1',
  MayaStagenet = 'mayachain-stagenet-v1',
  Optimism = '10',
  OptimismHex = '0xa',
  Polygon = '137',
  PolygonHex = '0x89',
  THORChain = 'thorchain-mainnet-v1',
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
  Maya = 'https://tendermint.mayachain.info',
  MayaStagenet = 'https://stagenet.tendermint.mayachain.info',
  Optimism = 'https://mainnet.optimism.io',
  Polygon = 'https://polygon-rpc.com',
  THORChain = 'https://rpc.thorswap.net',
  THORChainStagenet = 'https://stagenet-rpc.ninerealms.com',
}

export enum ApiUrl {
  Cosmos = 'https://node-router.thorswap.net/cosmos/rest',
  MayanodeMainnet = 'https://mayanode.mayachain.info',
  MayanodeStagenet = 'https://stagenet.mayanode.mayachain.info',
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
type AddChainWalletParams = {
    chain: Chain;
    wallet: ChainWallet;
    walletMethods: any;
};

type Asset = {
    chain: Chain;
    symbol: string;
    ticker: string;
    synth?: boolean;
};

type ChainWallet = {
    address: string;
    balance: any[];
    walletType: WalletOption;
};

type ConnectConfig = {
    stagenet?: boolean;
    /**
     * @required for AVAX & BSC
     */
    covalentApiKey?: string;
    /**
     * @required for ETH
     */
    ethplorerApiKey?: string;
    /**
     * @required for BTC, LTC, DOGE & BCH
     */
    utxoApiKey?: string;
    /**
     * @required for Walletconnect
     */
    walletConnectProjectId?: string;
    /**
     * @optional for Trezor config
     */
    trezorManifest?: {
        email: string;
        appUrl: string;
    };
};

type ConnectMethodNames = 'connectEVMWallet' | 'connectKeplr' | 'connectKeystore' | 'connectLedger' | 'connectOkx' | 'connectTrezor' | 'connectWalletconnect' | 'connectXDEFI';

type ConnectWalletParams = {
    addChain: (params: AddChainWalletParams) => void;
    config: ConnectConfig;
    rpcUrls: {
        [chain in Chain]?: string;
    };
    apis: ApisType;
};

type CosmosChain = Chain.Cosmos | Chain.THORChain | Chain.Binance;

type DerivationPathArray = [number, number, number, number, number]

type ErrorInfo = {
    status: number;
    revision: string;
    type?: ERROR_TYPE;
    module: ERROR_MODULE;
    code: ERROR_CODE;
    message?: string | undefined;
    stack?: string;
    identifier?: string;
    options?: ApiErrorOptions;
    displayMessageParams?: string[];
};

type EVMChain = Chain.Ethereum | Chain.Avalanche | Chain.BinanceSmartChain | Chain.Arbitrum | Chain.Optimism | Chain.Polygon;

type EVMTxBaseParams<T = bigint> = {
    to?: string;
    from?: string;
    nonce?: number;
    gasLimit?: T;
    data?: string;
    value?: T;
    chainId?: T;
};

type EVMWalletOptions = WalletOption.BRAVE | WalletOption.METAMASK | WalletOption.TRUSTWALLET_WEB | WalletOption.COINBASE_WEB;

type ExtendParams<WalletConnectMethodNames = ''> = {
    excludedChains?: Chain[];
    config?: ConnectConfig;
    rpcUrls?: {
        [chain in Chain]?: string;
    };
    apis?: ApisType;
    wallets: {
        connectMethodName: ConnectMethodNames | WalletConnectMethodNames;
        connect: (params: ConnectWalletParams) => (...params: any) => Promise<any>;
    }[];
};

type FixedNumberish = string | number | FixedNumber;

type GetAddressAndPubKeyResponse = {
    bech32_address: string;
    compressed_pk: any;
    error_message: string;
    return_code: number;
};

type Signature = {
    pub_key: {
        type: string;
        value: string;
    };
    sequence: string;
    signature: string;
};

type UTXOChain = Chain.Bitcoin | Chain.BitcoinCash | Chain.Dogecoin | Chain.Litecoin;

type WalletTxParams = {
    feeOptionKey?: FeeOption;
    from?: string;
    memo?: string;
    recipient: string;
};

type Witness = {
    value: number;
    script: Buffer;
};

```
