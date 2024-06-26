import { Chain } from "@swapkit/helpers";

import { GaiaToolbox } from "./gaia.ts";
import { KujiraToolbox } from "./kujira.ts";
import { MayaToolbox, ThorchainToolbox } from "./thorchain.ts";

type ToolboxType = {
  THOR: typeof ThorchainToolbox;
  GAIA: typeof GaiaToolbox;
  KUJI: typeof KujiraToolbox;
  MAYA: typeof MayaToolbox;
};

export const getToolboxByChain = <T extends keyof ToolboxType>(chain: T): ToolboxType[T] => {
  switch (chain) {
    case Chain.Kujira:
      return KujiraToolbox as ToolboxType[T];
    case Chain.Maya:
      return MayaToolbox as ToolboxType[T];
    case Chain.THORChain:
      return ThorchainToolbox as ToolboxType[T];
    case Chain.Cosmos:
      return GaiaToolbox as ToolboxType[T];
    default:
      throw new Error(`Chain ${chain} is not supported`);
  }
};
