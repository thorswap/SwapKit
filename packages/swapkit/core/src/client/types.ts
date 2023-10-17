import type { QuoteRoute } from '@swapkit/api';
import type { AssetValue, SwapKitNumber } from '@swapkit/helpers';
import type {
  BinanceToolbox,
  DepositParam,
  GaiaToolbox,
  ThorchainToolboxType,
} from '@swapkit/toolbox-cosmos';
import type {
  ARBToolbox,
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  MATICToolbox,
  OPToolbox,
} from '@swapkit/toolbox-evm';
import type { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } from '@swapkit/toolbox-utxo';
import type { Chain, FeeOption, WalletOption } from '@swapkit/types';

type BaseWalletMethods = {
  getAddress: () => Promise<string> | string;
};

export type CoreTxParams = {
  assetValue: AssetValue;
  recipient: string;
  memo?: string;
  feeOptionKey?: FeeOption;
  feeRate?: number;
  data?: string;
  from?: string;
  expiration?: number;
};

export type AddLiquidityTxns = {
  runeTx?: string;
  assetTx?: string;
};

export type UpgradeParams = {
  runeAmount: SwapKitNumber;
  recipient: string;
};

export type ChainWallet = {
  address: string;
  balance: AssetValue[];
  walletType: WalletOption;
};

export type Wallet = Record<Chain, ChainWallet | null>;

export type ThorchainWallet = BaseWalletMethods &
  ThorchainToolboxType & {
    transfer: (params: CoreTxParams) => Promise<string>;
    deposit: (params: DepositParam) => Promise<string>;
  };

export type CosmosBasedWallet<T extends typeof BinanceToolbox | typeof GaiaToolbox> =
  BaseWalletMethods &
    ReturnType<T> & {
      transfer: (params: CoreTxParams) => Promise<string>;
    };

export type EVMWallet<
  T extends typeof AVAXToolbox | typeof BSCToolbox | typeof ETHToolbox | typeof OPToolbox,
> = BaseWalletMethods &
  ReturnType<T> & {
    transfer: (params: CoreTxParams) => Promise<string>;
  };

export type UTXOWallet<
  T extends typeof BCHToolbox | typeof BTCToolbox | typeof DOGEToolbox | typeof LTCToolbox,
> = BaseWalletMethods &
  ReturnType<T> & {
    transfer: (prams: CoreTxParams) => Promise<string>;
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
  [Chain.Maya]: ThorchainWallet | null;
  [Chain.Optimism]: EVMWallet<typeof OPToolbox> | null;
  [Chain.Polygon]: EVMWallet<typeof MATICToolbox> | null;
  [Chain.THORChain]: ThorchainWallet | null;
};

export type SwapParams = {
  recipient: string;
  streamSwap?: boolean;
  route: QuoteRoute;
  feeOptionKey: FeeOption;
};
