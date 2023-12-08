import { Chain, type EVMChain } from '@swapkit/types';

import { ARBToolbox } from './arb.ts';
import { AVAXToolbox } from './avax.ts';
import { BSCToolbox } from './bsc.ts';
import { ETHToolbox } from './eth.ts';
import { MATICToolbox } from './matic.ts';
import { OPToolbox } from './op.ts';

export const getToolboxByChain = async (chain: EVMChain) => {
  switch (chain) {
    case Chain.Avalanche:
      return AVAXToolbox;
    case Chain.Arbitrum:
      return ARBToolbox;
    case Chain.Optimism:
      return OPToolbox;
    case Chain.Polygon:
      return MATICToolbox;
    case Chain.BinanceSmartChain:
      return BSCToolbox;
    default:
      return ETHToolbox;
  }
};
