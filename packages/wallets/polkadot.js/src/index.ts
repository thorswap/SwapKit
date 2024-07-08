import type { Injected } from "./types.ts";
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
