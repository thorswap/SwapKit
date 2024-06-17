import type { EthereumWindowProvider } from "@swapkit/helpers";
export { talismanWallet } from "./talisman.ts";

declare global {
  interface Window {
    talismanEth: EthereumWindowProvider;
  }
}
