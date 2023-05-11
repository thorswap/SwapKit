import { FixedNumber } from '@ethersproject/bignumber';

import { Chain } from './network.js';
import { WalletOption } from './wallet.js';

type UTXOChains = Chain.Bitcoin | Chain.Litecoin | Chain.Doge | Chain.BitcoinCash;
type EVMChains = Chain.Ethereum | Chain.BinanceSmartChain | Chain.Avalanche;

type ConnectMethodNames =
  | 'connectXDEFI'
  | 'connectKeplr'
  | 'connectTrustwallet'
  | 'connectWalletconnect'
  | 'connectKeystore'
  | 'connectLedger'
  | 'connectTrezor'
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

type ChainWallet = {
  address: string;
  balance: any[];
  walletType: WalletOption;
};

type ParamsWithChain<T> = T & { chain: Chain };
export type AddChainWalletParams = ParamsWithChain<{
  wallet: ChainWallet;
  walletMethods: any;
}>;

export type TxHash = string;

export type Address = string;

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
type ApisType = { [key in UTXOChains]?: string | any } & {
  [key in EVMChains]?: string | any;
} & {
  [key in Chain.Cosmos]?: string;
};

export type ConnectWalletParams = {
  addChain: (params: AddChainWalletParams) => void;
  config: ConnectConfig;
  rpcUrls: { [chain in Chain]?: string };
  apis: ApisType;
};

export type ExtendParams = {
  excludedChains?: Chain[];
  config?: ConnectConfig;
  rpcUrls?: { [chain in Chain]?: string };
  apis?: ApisType;
  wallets: {
    connectMethodName: ConnectMethodNames;
    connect: (params: ConnectWalletParams) => (...params: any) => Promise<any>;
  }[];
};
