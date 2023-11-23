import type { CosmosChain } from '@swapkit/types';
import { Chain } from '@swapkit/types';

import { BinanceToolbox } from './binance.ts';
import { GaiaToolbox } from './gaia.ts';
import { KujiraToolbox } from './kujira.ts';
import { MayaToolbox, ThorchainToolbox } from './thorchain.ts';

export const getToolboxByChain = async (chain: CosmosChain) => {
  switch (chain) {
    case Chain.Cosmos:
      return GaiaToolbox;
    case Chain.THORChain:
      return ThorchainToolbox;
    case Chain.Kujira:
      return KujiraToolbox;
    case Chain.Maya:
      return MayaToolbox;
    case Chain.Binance:
      return BinanceToolbox;
  }
};
