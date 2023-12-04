import { Chain, type UTXOChain } from '@swapkit/types';

import { BCHToolbox } from './bch.ts';
import { BTCToolbox } from './btc.ts';
import { DOGEToolbox } from './doge.ts';
import { LTCToolbox } from './ltc.ts';

export const getToolboxByChain = async <T extends UTXOChain>(chain: T) => {
  switch (chain) {
    case Chain.BitcoinCash:
      return BCHToolbox;
    case Chain.Bitcoin:
      return BTCToolbox;
    case Chain.Dogecoin:
      return DOGEToolbox;
    case Chain.Litecoin:
      return LTCToolbox;
    default:
      return BTCToolbox;
  }
};
