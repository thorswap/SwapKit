import type { EthereumWindowProvider } from '@thorswap-lib/toolbox-evm';

declare global {
  interface Window {
    keplr: any;
    ethereum: EthereumWindowProvider;
    trustwallet: EthereumWindowProvider;
    coinbaseWalletExtension: EthereumWindowProvider;
    xfi?: {
      binance: any;
      bitcoin: any;
      bitcoincash: any;
      dogecoin: any;
      ethereum: EthereumWindowProvider;
      keplr: any;
      litecoin: any;
      thorchain: any;
    };
  }
}

export type XDEFIConfig = {
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  utxoApiKey?: string;
};
