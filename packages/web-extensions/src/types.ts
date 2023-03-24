import { Asset } from '@thorswap-lib/types';

export enum WalletStatus {
  NotInstalled,
  Detected,
}

export enum WindowProviderPath {
  None = '',
  Ethereum = 'ethereum',
  XDEFIEthereum = 'xfi.ethereum',
  Keplr = 'keplr',
}

export type WebCallParams = {
  contractAddress: string;
  abi: any;
  funcName: string;
  funcParams?: unknown[];
};

export type XDEFIDepositParams = { asset: Asset; amount: any; memo: string };

type EthereumWindowProvider = import('@ethersproject/providers').ExternalProvider & {
  isMetaMask?: boolean;
  isBraveWallet?: boolean;
  isCoinbaseWallet?: boolean;
  overrideIsMetaMask?: boolean;
  selectedProvider?: EthereumWindowProvider;
  isTrust?: boolean;
  __XDEFI?: boolean;
};

export type XDEFIConfig = {
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  utxoApiKey?: string;
};

export type EVMWalletConfig = {
  ethplorerApiKey?: string;
  covalentApiKey?: string;
};

export type KeplrConfig = {};

declare global {
  interface Window {
    keplr: import('@keplr-wallet/types').Keplr;
    ethereum: EthereumWindowProvider;
    trustwallet: EthereumWindowProvider;
    coinbaseWalletExtension: EthereumWindowProvider;
    xfi?: {
      binance: any;
      bitcoin: any;
      bitcoincash: any;
      dogecoin: any;
      ethereum: EthereumWindowProvider;
      litecoin: any;
      thorchain: any;
    };
  }
}
