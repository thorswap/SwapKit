import { Chain } from '@swapkit/types';

import { BCHToolbox } from './bch.ts';
import { BTCToolbox } from './btc.ts';
import { DOGEToolbox } from './doge.ts';
import { LTCToolbox } from './ltc.ts';

type ToolboxType = {
  BCH: typeof BCHToolbox;
  BTC: typeof BTCToolbox;
  DOGE: typeof DOGEToolbox;
  LTC: typeof LTCToolbox;
};

// @ts-expect-error false positive
export const getToolboxByChain = <T extends keyof ToolboxType>(chain: T): ToolboxType[T] => {
  switch (chain) {
    case Chain.BitcoinCash:
      return BCHToolbox as ToolboxType[T];
    case Chain.Bitcoin:
      return BTCToolbox as ToolboxType[T];
    case Chain.Dogecoin:
      return DOGEToolbox as ToolboxType[T];
    case Chain.Litecoin:
      return LTCToolbox as ToolboxType[T];
  }
};
