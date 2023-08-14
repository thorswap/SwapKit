import { FixedNumber } from '@ethersproject/bignumber';

import { Chain, CosmosChain, EVMChain, UTXOChain } from './network.js';
import { WalletOption } from './wallet.js';

type ConnectMethodNames =
  | 'connectEVMWallet'
  | 'connectKeplr'
  | 'connectKeystore'
  | 'connectLedger'
  | 'connectOkx'
  | 'connectTrezor'
  | 'connectWalletconnect'
  | 'connectXDEFI';

type ChainWallet = {
  address: string;
  balance: any[];
  walletType: WalletOption;
};

export type ConnectConfig = {
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

export type AddChainWalletParams = {
  chain: Chain;
  wallet: ChainWallet;
  walletMethods: any;
};

export type UTXO = {
  hash: string;
  index: number;
  value: number;
  txHex?: string;
  witnessUtxo?: Witness;
};

export type Witness = {
  value: number;
  script: Buffer;
};

export type FixedNumberish = string | number | FixedNumber;

// TODO: Add types for api interface
type ApisType = { [key in UTXOChain]?: string | any } & {
  [key in EVMChain]?: string | any;
} & {
  [key in CosmosChain]?: string;
};

export type ConnectWalletParams = {
  addChain: (params: AddChainWalletParams) => void;
  config: ConnectConfig;
  rpcUrls: { [chain in Chain]?: string };
  apis: ApisType;
};

export type ExtendParams<WalletConnectMethodNames = ''> = {
  excludedChains?: Chain[];
  config?: ConnectConfig;
  rpcUrls?: { [chain in Chain]?: string };
  apis?: ApisType;
  wallets: {
    connectMethodName: ConnectMethodNames | WalletConnectMethodNames;
    connect: (params: ConnectWalletParams) => (...params: any) => Promise<any>;
  }[];
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
