import type { EthereumWindowProvider } from "@swapkit/helpers";
import type { Injected, InjectedExtension } from "./types.ts";
export { talismanWallet } from "./talisman.ts";

declare global {
  interface Window {
    talismanEth: EthereumWindowProvider;
    injectedWeb3: {
      talisman: {
        connect?: (origin: string) => Promise<InjectedExtension>;
        enable?: (origin: string) => Promise<Injected>;
        version?: string;
      };
    };
  }
}
