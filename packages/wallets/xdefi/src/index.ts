import type { EthereumWindowProvider } from '@thorswap-lib/toolbox-evm';

export { xdefiWallet } from './xdefiWallet.js';

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
