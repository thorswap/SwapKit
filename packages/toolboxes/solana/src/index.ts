import { Chain } from "@swapkit/helpers";
import type { SOLToolbox } from "./toolbox";

export { SOLToolbox } from "./toolbox";

export type SolanaWallet = {
  [Chain.Solana]: ReturnType<typeof SOLToolbox>;
};
