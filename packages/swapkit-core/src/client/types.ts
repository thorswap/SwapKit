import { QuoteRoute } from '@thorswap-lib/cross-chain-api-sdk/lib/entities';
import { AssetAmount, Percent, Pool } from '@thorswap-lib/swapkit-entities';
import { ApproveParams, IsApprovedParams } from '@thorswap-lib/toolbox-evm';
import {
  AmountWithBaseDenom,
  Asset,
  Asset as AssetType,
  Balance,
  CallParams,
  Chain,
  DepositParams,
  EIP1559TxParams,
  FeeOption,
  SupportedChain,
  TxHash,
  TxHistoryParams,
  WalletOption,
  WalletTxParams,
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
  pool: Pool;
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

type ParamsWithChain<T> = T & { chain: SupportedChain };
export type AddChainWalletParams = ParamsWithChain<{
  wallet: ChainWallet;
  walletMethods: any;
}>;

export type Wallet = Record<SupportedChain, ChainWallet | null>;

export type WalletMethods = {
  [Chain.Avalanche]: BaseEVMWallet | null;
  [Chain.BinanceSmartChain]: BaseEVMWallet | null;
  [Chain.Binance]: BaseCosmosWallet | null;
  [Chain.BitcoinCash]: BaseUTXOWallet | null;
  [Chain.Bitcoin]: BaseUTXOWallet | null;
  [Chain.Cosmos]: BaseCosmosWallet | null;
  [Chain.Doge]: BaseUTXOWallet | null;
  [Chain.Ethereum]: BaseEVMWallet | null;
  [Chain.Litecoin]: BaseUTXOWallet | null;
  [Chain.THORChain]: BaseCosmosWallet | null;
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

/**
 * v1
 */

type WithBaseWallet<T> = T & {
  getBalance: (address: string, filterAssets?: Asset[] | undefined) => Promise<Balance[]>;
  getFees: (params?: { asset: AssetType; amount: AmountWithBaseDenom; recipient: string }) => any;
  getTransactions: (params?: TxHistoryParams) => any;
  transfer: (params: WalletTxParams) => Promise<TxHash>;
  validateAddress: (address: string) => boolean;
  getTransactionData: (txHash: string, address: string) => any;
};

export type BaseUTXOWallet = WithBaseWallet<{
  broadcastTx: (todoParam: any) => any;
  buildTx: (todoParam: any) => any;
  createKeysForPath: (todoParam: any) => any;
  getAddressFromKeys: (todoParam: any) => any;
  getFeeRates: (todoParam: any) => any;
  getFeesAndFeeRates: (todoParam: any) => any;
  getSuggestedFeeRate: (todoParam: any) => any;
}>;

export type BaseEVMWallet = WithBaseWallet<{
  EIP1193SendTransaction: (todoParam: any) => any;
  addAccountsChangedCallback: (todoParam: any) => any;
  approve: (params: ApproveParams) => Promise<TxHash>;
  broadcastTransaction: (todoParam: any) => any;
  call: (callParams: CallParams) => any;
  createContract: (address: string, abi: any, provider: any) => any;
  createContractTxObject: (todoParam: any) => any;
  deposit: (params: DepositParams) => Promise<TxHash>;
  estimateCall: (todoParam: any) => any;
  estimateGasLimit: () => any;
  estimateGasPrices: () => any;
  getETHDefaultWallet: (todoParam: any) => any;
  getFeeData: () => any;
  isApproved?: (params: IsApprovedParams) => Promise<string | number>;
  isDetected: (todoParam: any) => any;
  isWeb3Detected: (todoParam: any) => any;
  listWeb3EVMWallets: (todoParam: any) => any;
  sendTransaction?: (tx: EIP1559TxParams, feeOptionKey: FeeOption) => Promise<string>;
}>;

export type BaseCosmosWallet = WithBaseWallet<{
  buildSendTxBody: (todoParam: any) => any;
  createKeyPair: (todoParam: any) => any;
  getAccount: (todoParam: any) => any;
  getAddressFromMnemonic: (todoParam: any) => any;
  getFeeRateFromThorswap: (todoParam: any) => any;
  sdk: (todoParam: any) => any;
  signAndBroadcast: (todoParam: any) => any;
}>;

export type BaseWallet = {
  validateAddress: (address: string) => boolean;
  getBalance: (address: string, filterAssets?: Asset[] | undefined) => Promise<Balance[]>;
};

type ConnectMethodNames =
  | 'connectXDEFI'
  | 'connectKeplr'
  | 'connectWalletconnect'
  | 'connectKeystore'
  | 'connectLedger'
  | 'connectEVMWallet';

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
};

export type ExtendParams = {
  excludedChains?: Chain[];
  config?: ConnectConfig;
  wallets: {
    connectMethodName: ConnectMethodNames;
    connect: (params: {
      addChain: (params: AddChainWalletParams) => void;
      config: ConnectConfig;
    }) => (...params: any) => Promise<any>;
  }[];
};

export type SwapParams = {
  recipient: string;
  route: QuoteRoute;
  feeOptionKey: FeeOption;
};
