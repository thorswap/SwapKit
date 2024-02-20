import type { Keplr } from "@keplr-wallet/types";
import type { Eip1193Provider, EthereumWindowProvider } from "@swapkit/toolbox-evm";

export { xdefiWallet } from "./xdefiWallet.ts";

declare global {
  interface Window {
    keplr: Keplr;
    ethereum: EthereumWindowProvider;
    trustwallet: EthereumWindowProvider;
    coinbaseWalletExtension: EthereumWindowProvider;
    xfi?: {
      binance: Eip1193Provider;
      bitcoin: Eip1193Provider;
      bitcoincash: Eip1193Provider;
      dogecoin: Eip1193Provider;
      ethereum: Eip1193Provider;
      keplr: Keplr;
      litecoin: Eip1193Provider;
      thorchain: Eip1193Provider;
    };
  }
}
