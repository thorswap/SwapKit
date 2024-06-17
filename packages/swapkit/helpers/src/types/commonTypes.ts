import type { AssetValue } from "../modules/assetValue.ts";
import type { Chain, CosmosChain, EVMChain, UTXOChain } from "./chains.ts";
import type { WalletOption } from "./wallet.ts";

export type ConnectConfig = {
  stagenet?: boolean;
  /**
   * @required
   */
  thorswapApiKey?: string;
  /**
   * @required for AVAX & BSC
   */
  covalentApiKey?: string;
  /**
   * @required for ETH
   */
  ethplorerApiKey?: string;
  /**
   * @required for BTC, BCH, LTC, DOGE
   */
  blockchairApiKey?: string;
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
  /**
   * @optional for KeepKey config
   */
  keepkeyConfig?: {
    apiKey: string;
    pairingInfo: {
      name: string;
      imageUrl: string;
      basePath: string;
      url: string;
    };
  };
};

export type AddChainWalletParams<T extends Chain> = {
  address: string;
  balance: AssetValue[];
  walletType: WalletOption;
  chain: T;
  [key: string]: Todo;
};

type ApisType = { [key in UTXOChain]?: string | Todo } & {
  [key in EVMChain]?: string | Todo;
} & {
  [key in CosmosChain]?: string;
};

export type ConnectWalletParams = {
  addChain: <T extends Chain>(params: AddChainWalletParams<T>) => void;
  apis: ApisType;
  config: ConnectConfig;
  rpcUrls: { [chain in Chain]?: string };
};

export type Witness = {
  value: number;
  script: Buffer;
};

export enum QuoteMode {
  TC_SUPPORTED_TO_TC_SUPPORTED = "TC-TC",
  TC_SUPPORTED_TO_ETH = "TC-ERC20",
  TC_SUPPORTED_TO_AVAX = "TC-ARC20",
  TC_SUPPORTED_TO_BSC = "TC-BEP20",
  ETH_TO_TC_SUPPORTED = "ERC20-TC",
  ETH_TO_ETH = "ERC20-ERC20",
  ETH_TO_AVAX = "ERC20-ARC20",
  ETH_TO_BSC = "ERC20-BEP20",
  AVAX_TO_TC_SUPPORTED = "ARC20-TC",
  AVAX_TO_ETH = "ARC20-ERC20",
  AVAX_TO_AVAX = "ARC20-ARC20",
  AVAX_TO_BSC = "ARC20-BEP20",
  BSC_TO_TC_SUPPORTED = "BEP20-TC",
  BSC_TO_ETH = "BEP20-ERC20",
  BSC_TO_AVAX = "BEP20-ARC20",
  BSC_TO_BSC = "BEP20-BEP20",
}

export type Asset = {
  chain: Chain;
  symbol: string;
  ticker: string;
  synth?: boolean;
};

export const AGG_SWAP = [QuoteMode.ETH_TO_ETH, QuoteMode.AVAX_TO_AVAX, QuoteMode.BSC_TO_BSC];

export const SWAP_IN = [
  QuoteMode.ETH_TO_TC_SUPPORTED,
  QuoteMode.ETH_TO_AVAX,
  QuoteMode.ETH_TO_BSC,
  QuoteMode.AVAX_TO_TC_SUPPORTED,
  QuoteMode.AVAX_TO_ETH,
  QuoteMode.AVAX_TO_BSC,
  QuoteMode.BSC_TO_TC_SUPPORTED,
  QuoteMode.BSC_TO_ETH,
  QuoteMode.BSC_TO_AVAX,
];

export const SWAP_OUT = [
  QuoteMode.TC_SUPPORTED_TO_TC_SUPPORTED,
  QuoteMode.TC_SUPPORTED_TO_ETH,
  QuoteMode.TC_SUPPORTED_TO_AVAX,
  QuoteMode.TC_SUPPORTED_TO_BSC,
];
