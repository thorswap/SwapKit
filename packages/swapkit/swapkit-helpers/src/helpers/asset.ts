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

export const getCommonAssetInfo = (
  assetString: 'ETH.THOR' | 'ETH.vTHOR' | Chain,
): { identifier: string; decimal: number } => {
  switch (assetString) {
    case 'ETH.THOR':
      return { identifier: 'ETH.THOR-0xa5f2211B9b8170F694421f2046281775E8468044', decimal: 18 };
    case 'ETH.vTHOR':
      return { identifier: 'ETH.vTHOR-0x815C23eCA83261b6Ec689b60Cc4a58b54BC24D8D', decimal: 18 };

    case Chain.Cosmos:
      return { identifier: 'GAIA.ATOM', decimal: BaseDecimal[assetString] };
    case Chain.THORChain:
      return { identifier: 'THOR.RUNE', decimal: BaseDecimal[assetString] };
    case Chain.BinanceSmartChain:
      return { identifier: 'BSC.BNB', decimal: BaseDecimal[assetString] };

    case Chain.Arbitrum:
    case Chain.Optimism:
      return { identifier: 'ETH.ETH', decimal: BaseDecimal[assetString] };

    case Chain.BitcoinCash:
    case Chain.Litecoin:
    case Chain.Dogecoin:
    case Chain.Binance:
    case Chain.Avalanche:
    case Chain.Polygon:
    case Chain.Bitcoin:
    case Chain.Ethereum:
      return { identifier: `${assetString}.${assetString}`, decimal: BaseDecimal[assetString] };
  }
};

export const getAssetType = ({ chain, symbol }: { chain: Chain; symbol: string }) => {
  switch (chain) {
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin:
    case Chain.THORChain:
      return 'Native';

    case Chain.Cosmos:
      return symbol === 'ATOM' ? 'Native' : 'GAIA';
    case Chain.Binance:
      return symbol === Chain.Binance ? 'Native' : 'BEP2';
    case Chain.BinanceSmartChain:
      return symbol === Chain.Binance ? 'Native' : 'BEP20';
    case Chain.Ethereum:
      return symbol === Chain.Ethereum ? 'Native' : 'ERC20';
    case Chain.Avalanche:
      return symbol === Chain.Avalanche ? 'Native' : 'AVAX';
    case Chain.Polygon:
      return symbol === Chain.Polygon ? 'Native' : 'POLYGON';

    case Chain.Arbitrum:
      return [Chain.Ethereum, Chain.Arbitrum].includes(symbol as Chain) ? 'Native' : 'ARBITRUM';
    case Chain.Optimism:
      return [Chain.Ethereum, Chain.Optimism].includes(symbol as Chain) ? 'Native' : 'OPTIMISM';
  }
};
