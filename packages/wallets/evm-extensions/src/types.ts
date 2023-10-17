import type { Eip1193Provider } from 'ethers';

export type EVMWalletConfig = {
  ethplorerApiKey?: string;
  covalentApiKey?: string;
};

declare global {
  interface Window {
    ethereum: Eip1193Provider;
    trustwallet: Eip1193Provider;
    coinbaseWalletExtension: Eip1193Provider;
    xfi?: {
      binance: any;
      bitcoin: any;
      bitcoincash: any;
      dogecoin: any;
      ethereum: Eip1193Provider;
      litecoin: any;
      thorchain: any;
    };
  }
}
