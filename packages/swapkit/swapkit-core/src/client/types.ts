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
  memo?: string;
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

export type SwapParams = {
  recipient: string;
  streamSwap?: boolean;
  route: QuoteRoute;
  feeOptionKey: FeeOption;
};
