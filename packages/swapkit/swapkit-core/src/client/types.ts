import type { QuoteRoute } from '@thorswap-lib/swapkit-api';
import { Amount, AssetAmount, AssetEntity, Pool } from '@thorswap-lib/swapkit-entities';
import type {
  BinanceToolbox,
  DepositParam,
  GaiaToolbox,
  ThorchainToolboxType,
} from '@thorswap-lib/toolbox-cosmos';
import type {
  ARBToolbox,
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  MATICToolbox,
  OPToolbox,
} from '@thorswap-lib/toolbox-evm';
import type { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } from '@thorswap-lib/toolbox-utxo';
import { BaseWalletMethods, Chain, FeeOption, TxParams, WalletOption } from '@thorswap-lib/types';

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
  runeTx?: string;
  assetTx?: string;
};

type LPType = 'sym' | 'rune' | 'asset';
export type WithdrawParams = {
  asset: AssetEntity;
  percent: Amount;
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

export type EVMWallet<
  T extends typeof AVAXToolbox | typeof BSCToolbox | typeof ETHToolbox | typeof OPToolbox,
> = BaseWalletMethods &
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
  [Chain.Arbitrum]: EVMWallet<typeof ARBToolbox> | null;
  [Chain.Avalanche]: EVMWallet<typeof AVAXToolbox> | null;
  [Chain.BinanceSmartChain]: EVMWallet<typeof BSCToolbox> | null;
  [Chain.Binance]: CosmosBasedWallet<typeof BinanceToolbox> | null;
  [Chain.BitcoinCash]: UTXOWallet<typeof BCHToolbox> | null;
  [Chain.Bitcoin]: UTXOWallet<typeof BTCToolbox> | null;
  [Chain.Cosmos]: CosmosBasedWallet<typeof GaiaToolbox> | null;
  [Chain.Dogecoin]: UTXOWallet<typeof DOGEToolbox> | null;
  [Chain.Ethereum]: EVMWallet<typeof ETHToolbox> | null;
  [Chain.Litecoin]: UTXOWallet<typeof LTCToolbox> | null;
  [Chain.THORChain]: ThorchainWallet | null;
  [Chain.Optimism]: EVMWallet<typeof OPToolbox> | null;
  [Chain.Polygon]: EVMWallet<typeof MATICToolbox> | null;
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

export type SwapParams = {
  recipient: string;
  streamSwap?: boolean;
  route: QuoteRoute;
  feeOptionKey: FeeOption;
};
