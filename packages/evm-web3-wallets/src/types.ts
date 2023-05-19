import type { EthereumWindowProvider } from '@thorswap-lib/toolbox-evm';

export type EVMWalletConfig = {
  ethplorerApiKey?: string;
  covalentApiKey?: string;
};

declare global {
  interface Window {
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
