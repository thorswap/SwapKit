import { Chain } from '@thorswap-lib/types';
import type { BigNumber } from 'bignumber.js';

export const getAssetType = (chain: Chain, ticker: string, isSynth = false) => {
  if (isSynth) return 'Synth';

  switch (chain) {
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Doge:
    case Chain.Litecoin:
    case Chain.THORChain:
      return 'Native';
    case Chain.Cosmos:
      return ticker === 'ATOM' ? 'Native' : 'GAIA';
    case Chain.Binance:
      return ticker === 'BNB' ? 'Native' : 'BEP2';
    case Chain.BinanceSmartChain:
      return ticker === 'BNB' ? 'Native' : 'BEP20';
    case Chain.Ethereum:
      return ticker === 'ETH' ? 'Native' : 'ERC20';
    case Chain.Avalanche:
      return ticker === 'AVAX' ? 'Native' : 'AVAX';
    default:
      return chain;
  }
};

export const BN_FORMAT: BigNumber.Format = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  suffix: '',
};
