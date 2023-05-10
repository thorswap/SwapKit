import type { QuoteRoute } from '@thorswap-lib/swapkit-api';
import { AssetAmount, AssetEntity, Percent, Pool } from '@thorswap-lib/swapkit-entities';
import type {
  BinanceToolbox,
  DepositParam,
  GaiaToolbox,
  ThorchainToolboxType,
} from '@thorswap-lib/toolbox-cosmos';
import type { AVAXToolbox, BSCToolbox, ETHToolbox } from '@thorswap-lib/toolbox-evm';
import type { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } from '@thorswap-lib/toolbox-utxo';
import {
  AmountWithBaseDenom,
  Chain,
  FeeOption,
  TxHash,
  TxParams,
  WalletOption,
} from '@thorswap-lib/types';

export type { TransactionDetails } from '@thorswap-lib/cross-chain-api-sdk';
export type {
  Calldata,
  CalldataSwapIn,
  CalldataSwapOut,
  CalldataTcToTc,
  Provider,
  Quote,
  QuoteMeta,
  QuoteRoute,
  QuoteSwap,
  Token,
  TokenList,
} from '@thorswap-lib/cross-chain-api-sdk/lib/entities';

export type CoreTxParams = {
  assetAmount: AssetAmount;
  recipient: string;
  memo?: string;
  feeOptionKey?: FeeOption;
  feeRate?: number;
  data?: string;
  from?: string;
};

export type AddLiquidityParams = {
  pool: Pool;
  isPendingSymmAsset?: boolean;
  runeAmount?: AssetAmount;
  assetAmount?: AssetAmount;
  runeAddr?: string;
  assetAddr?: string;
  mode?: LPType;
};

export type CreateLiquidityParams = {
  runeAmount: AssetAmount;
  assetAmount: AssetAmount;
};

export type AddLiquidityTxns = {
  runeTx?: TxHash;
  assetTx?: TxHash;
};

type LPType = 'sym' | 'rune' | 'asset';
export type WithdrawParams = {
  asset: AssetEntity;
  percent: Percent;
  from: LPType;
  to: LPType;
};

export type UpgradeParams = {
  runeAmount: AssetAmount;
  recipient: string;
};

export type ChainWallet = {
  address: string;
  balance: AssetAmount[];
  walletType: WalletOption;
};

export type Wallet = Record<Chain, ChainWallet | null>;

export type BaseWalletMethods = {
  getAddress: () => string;
};

export type ThorchainWallet = BaseWalletMethods &
  ThorchainToolboxType & {
    transfer: (params: TxParams) => Promise<string>;
    deposit: (params: DepositParam) => Promise<string>;
  };

export type CosmosBasedWallet<T extends typeof BinanceToolbox | typeof GaiaToolbox> =
  BaseWalletMethods &
    ReturnType<T> & {
      transfer: (params: TxParams) => Promise<string>;
    };

export type EVMWallet<T extends typeof AVAXToolbox | typeof BSCToolbox | typeof ETHToolbox> =
  BaseWalletMethods &
    ReturnType<T> & {
      transfer: (params: TxParams) => Promise<string>;
    };

export type UTXOWallet<
  T extends typeof BCHToolbox | typeof BTCToolbox | typeof DOGEToolbox | typeof LTCToolbox,
> = BaseWalletMethods &
  ReturnType<T> & {
    transfer: (prams: TxParams) => Promise<string>;
  };

export type WalletMethods = {
  [Chain.Avalanche]: EVMWallet<typeof AVAXToolbox> | null;
  [Chain.BinanceSmartChain]: EVMWallet<typeof BSCToolbox> | null;
  [Chain.Binance]: CosmosBasedWallet<typeof BinanceToolbox> | null;
  [Chain.BitcoinCash]: UTXOWallet<typeof BCHToolbox> | null;
  [Chain.Bitcoin]: UTXOWallet<typeof BTCToolbox> | null;
  [Chain.Cosmos]: CosmosBasedWallet<typeof GaiaToolbox> | null;
  [Chain.Doge]: UTXOWallet<typeof DOGEToolbox> | null;
  [Chain.Ethereum]: EVMWallet<typeof ETHToolbox> | null;
  [Chain.Litecoin]: UTXOWallet<typeof LTCToolbox> | null;
  [Chain.THORChain]: ThorchainWallet | null;
};

export enum QuoteMode {
  TC_SUPPORTED_TO_TC_SUPPORTED = 'TC-TC',
  ETH_TO_TC_SUPPORTED = 'ERC20-TC',
  TC_SUPPORTED_TO_ETH = 'TC-ERC20',
  ETH_TO_ETH = 'ERC20-ERC20',
  AVAX_TO_AVAX = 'ARC20-ARC20',
  AVAX_TO_TC_SUPPORTED = 'ARC20-TC',
  TC_SUPPORTED_TO_AVAX = 'TC-ARC20',
  AVAX_TO_ETH = 'ARC20-ERC20',
  ETH_TO_AVAX = 'ERC20-ARC20',
}

export type FeeRate = number;
export type FeeRates = Record<FeeOption, FeeRate>;

export enum FeeType {
  FlatFee = 'base',
  PerByte = 'byte',
}

export type LegacyFees = Record<FeeOption, AmountWithBaseDenom> & {
  type: FeeType;
};

export type SwapParams = {
  recipient: string;
  route: QuoteRoute;
  feeOptionKey: FeeOption;
};
