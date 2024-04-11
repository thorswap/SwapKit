import { Chain } from "@swapkit/helpers";

import { ARBToolbox } from "./arb.ts";
import { AVAXToolbox } from "./avax.ts";
import { BSCToolbox } from "./bsc.ts";
import { ETHToolbox } from "./eth.ts";
import { MATICToolbox } from "./matic.ts";
import { OPToolbox } from "./op.ts";

type ToolboxType = {
  ETH: typeof ETHToolbox;
  AVAX: typeof AVAXToolbox;
  BSC: typeof BSCToolbox;
  MATIC: typeof MATICToolbox;
  ARB: typeof ARBToolbox;
  OP: typeof OPToolbox;
};

export const getToolboxByChain = <T extends keyof ToolboxType>(chain: T): ToolboxType[T] => {
  switch (chain) {
    case Chain.Avalanche:
      return AVAXToolbox as ToolboxType[T];
    case Chain.Arbitrum:
      return ARBToolbox as ToolboxType[T];
    case Chain.Optimism:
      return OPToolbox as ToolboxType[T];
    case Chain.Polygon:
      return MATICToolbox as ToolboxType[T];
    case Chain.BinanceSmartChain:
      return BSCToolbox as ToolboxType[T];
    case Chain.Ethereum:
      return ETHToolbox as ToolboxType[T];
    default:
      throw new Error(`Chain ${chain} is not supported`);
  }
};
