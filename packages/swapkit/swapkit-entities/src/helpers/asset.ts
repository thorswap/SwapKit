import { Chain } from '@thorswap-lib/types';
import type { BigNumber } from 'bignumber.js';

export const getAssetType = (chain: Chain, ticker: string, isSynth = false) => {
  if (isSynth) return 'Synth';

  switch (chain) {
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin:
    case Chain.THORChain:
      return 'Native';

    case Chain.Cosmos:
      return ticker === 'ATOM' ? 'Native' : 'GAIA';
    case Chain.Binance:
      return ticker === Chain.Binance ? 'Native' : 'BEP2';
    case Chain.BinanceSmartChain:
      return ticker === Chain.Binance ? 'Native' : 'BEP20';
    case Chain.Ethereum:
      return ticker === Chain.Ethereum ? 'Native' : 'ERC20';
    case Chain.Avalanche:
      return ticker === Chain.Avalanche ? 'Native' : 'AVAX';
    case Chain.Polygon:
      return ticker === Chain.Polygon ? 'Native' : 'POLYGON';

    case Chain.Arbitrum:
      return [Chain.Ethereum, Chain.Arbitrum].includes(ticker as Chain) ? 'Native' : 'ARBITRUM';
    case Chain.Optimism:
      return [Chain.Ethereum, Chain.Optimism].includes(ticker as Chain) ? 'Native' : 'OPTIMISM';

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
