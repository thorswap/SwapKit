import type { AssetValue, QuoteRoute, SwapKitNumber } from "@swapkit/helpers";
import type {
  BinanceToolbox,
  DepositParam,
  GaiaToolbox,
  KujiraToolbox,
  ThorchainToolboxType,
} from "@swapkit/toolbox-cosmos";
import type {
  ARBToolbox,
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  MATICToolbox,
  OPToolbox,
} from "@swapkit/toolbox-evm";
import type { ChainflipToolbox, PolkadotToolbox } from "@swapkit/toolbox-substrate";
import type {
  BCHToolbox,
  BTCToolbox,
  DASHToolbox,
  DOGEToolbox,
  LTCToolbox,
} from "@swapkit/toolbox-utxo";
import {
  Chain,
  type ConnectConfig,
  type CosmosChain,
  type EVMChain,
  type FeeOption,
  type UTXOChain,
  type WalletOption,
} from "@swapkit/types";

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

export type OldChainWallet = {
  address: string;
  balance: AssetValue[];
  walletType: WalletOption;
};

export type OldWallet = { [key in Chain]: OldChainWallet | null };

export type ChainWallet<T extends Chain> = WalletMethods[T] & {
  chain: Chain;
  address: string;
  balance: AssetValue[];
  walletType: WalletOption;
};

export type Wallet = {
  [key in Chain]?: ChainWallet<key>;
};

export type ThorchainWallet = ThorchainToolboxType & {
  transfer: (params: CoreTxParams) => Promise<string>;
  deposit: (params: DepositParam) => Promise<string>;
};

export type CosmosBasedWallet<T extends typeof BinanceToolbox | typeof GaiaToolbox> =
  ReturnType<T> & {
    transfer: (params: CoreTxParams) => Promise<string>;
  };

export type SubstrateBasedWallet<T extends typeof PolkadotToolbox | typeof ChainflipToolbox> =
  Awaited<ReturnType<T>>;

export type EVMWallet<
  T extends typeof AVAXToolbox | typeof BSCToolbox | typeof ETHToolbox | typeof OPToolbox,
> = ReturnType<T> & {
  transfer: (params: CoreTxParams) => Promise<string>;
};

export type UTXOWallet<
  T extends typeof BCHToolbox | typeof BTCToolbox | typeof DOGEToolbox | typeof LTCToolbox,
> = ReturnType<T> & {
  transfer: (prams: CoreTxParams) => Promise<string>;
};

export type WalletMethods = {
  [Chain.Arbitrum]: EVMWallet<typeof ARBToolbox> | null;
  [Chain.Avalanche]: EVMWallet<typeof AVAXToolbox> | null;
  [Chain.BinanceSmartChain]: EVMWallet<typeof BSCToolbox> | null;
  [Chain.Binance]: CosmosBasedWallet<typeof BinanceToolbox> | null;
  [Chain.BitcoinCash]: UTXOWallet<typeof BCHToolbox> | null;
  [Chain.Bitcoin]: UTXOWallet<typeof BTCToolbox> | null;
  [Chain.Chainflip]: SubstrateBasedWallet<typeof ChainflipToolbox> | null;
  [Chain.Cosmos]: CosmosBasedWallet<typeof GaiaToolbox> | null;
  [Chain.Dash]: UTXOWallet<typeof DASHToolbox> | null;
  [Chain.Dogecoin]: UTXOWallet<typeof DOGEToolbox> | null;
  [Chain.Ethereum]: EVMWallet<typeof ETHToolbox> | null;
  [Chain.Kujira]: CosmosBasedWallet<typeof KujiraToolbox> | null;
  [Chain.Litecoin]: UTXOWallet<typeof LTCToolbox> | null;
  [Chain.Maya]: ThorchainWallet | null;
  [Chain.Optimism]: EVMWallet<typeof OPToolbox> | null;
  [Chain.Polkadot]: SubstrateBasedWallet<typeof PolkadotToolbox> | null;
  [Chain.Polygon]: EVMWallet<typeof MATICToolbox> | null;
  [Chain.THORChain]: ThorchainWallet | null;
};

export type QuoteRouteV2 = {
  buyAsset: string;
  sellAsset: string;
  sellAmount: number;
  destinationAddress: string;
  sourceAddress: string;
  providers: string[];
};

export type SwapWithRouteParams = {
  recipient: string;
  route: QuoteRoute | QuoteRouteV2;
  feeOptionKey?: FeeOption;
  quoteId?: string;
  streamSwap?: boolean;
};

type ApisType = { [key in UTXOChain]?: string | any } & {
  [key in EVMChain]?: string | any;
} & {
  [key in CosmosChain]?: string;
};

export type ConnectWalletParamsLocal = {
  addChain: (params: ChainWallet<Chain>) => void;
  config: ConnectConfig;
  rpcUrls: { [chain in Chain]?: string };
  apis: ApisType;
};
