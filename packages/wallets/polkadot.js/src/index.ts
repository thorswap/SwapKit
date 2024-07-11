import type { Injected } from "@swapkit/toolbox-substrate";
export { polkadotWallet } from "./polkadot.ts";

declare global {
  interface Window {
    injectedWeb3: {
      "polkadot-js": {
        enable?: (origin: string) => Promise<Injected>;
        version?: string;
      };
    };
  }
}
