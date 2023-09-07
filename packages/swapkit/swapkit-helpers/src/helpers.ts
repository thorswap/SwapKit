import { BaseDecimal, Chain } from '@thorswap-lib/types';

export const isGasAsset = ({ chain, symbol }: { chain: Chain; symbol: string }) => {
  switch (chain) {
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Litecoin:
    case Chain.Dogecoin:
    case Chain.Binance:
    case Chain.Ethereum:
    case Chain.Avalanche:
      return symbol === chain;

    case Chain.Arbitrum:
      // @TODO (@Towan) check if this is correct
      return [Chain.Ethereum, Chain.Arbitrum].includes(chain);

    case Chain.Cosmos:
      return symbol === 'ATOM';
    case Chain.Polygon:
      return symbol === 'MATIC';
    case Chain.Optimism:
      return symbol === 'OP';
    case Chain.BinanceSmartChain:
      return symbol === 'BNB';
    case Chain.THORChain:
      return symbol === 'RUNE';
  }
};

// TODO (@Chillos, @Towan): implement this function properly as current only fits our token list
const getAVAXAssetDecimal = async (symbol: string) => {
  if (symbol.includes('USDT') || symbol.includes('USDC')) return 6;
  if (['BTC.b', 'WBTC.e'].includes(symbol)) return 8;
  if (symbol === 'Time') return 9;

  return BaseDecimal.AVAX;
};

const getETHAssetDecimal = async (symbol: string) => {
  if (symbol === Chain.Ethereum) return BaseDecimal.ETH;

  return BaseDecimal.ETH;
};

const getBSCAssetDecimal = async (symbol: string) => {
  if (symbol === Chain.Ethereum) return BaseDecimal.BSC;

  return BaseDecimal.BSC;
};

export const getDecimal = async ({ chain, symbol }: { chain: Chain; symbol: string }) => {
  switch (chain) {
    case Chain.Ethereum:
      return getETHAssetDecimal(symbol);
    case Chain.Avalanche:
      return getAVAXAssetDecimal(symbol);
    case Chain.BinanceSmartChain:
      return getBSCAssetDecimal(symbol);
    default:
      return BaseDecimal[chain];
  }
};
