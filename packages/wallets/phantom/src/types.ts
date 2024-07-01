import type { SolanaProvider } from "@swapkit/toolbox-solana";

declare global {
  interface Window {
    phantom: {
      solana: SolanaProvider;
    };
  }
}
