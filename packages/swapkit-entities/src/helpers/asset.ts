import { Chain } from '@thorswap-lib/types';

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
    case Chain.Optimism:
    case Chain.Arbitrum:
    case Chain.Ethereum:
      return ticker === 'ETH' ? 'Native' : 'ERC20';
    case Chain.Avalanche:
      return ticker === 'AVAX' ? 'Native' : 'AVAX';
    case Chain.Polygon:
      return ticker === 'MATIC' ? 'Native' : 'MATIC';
    default:
      return chain;
  }
};
