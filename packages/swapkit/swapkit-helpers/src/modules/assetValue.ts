import { Chain } from '@thorswap-lib/types';

import { SwapKitNumber } from './swapKitNumber.ts';

type Params = { decimal: number; value: number | string } & (
  | { chain: Chain; symbol: string }
  | { identifier: string }
);

const isGasAsset = ({ chain, symbol }: { chain: Chain; symbol: string }) => {
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

const getAssetInfo = (identifier: string) => {
  const [chain, symbol] = identifier.split('.') as [Chain, string];
  const [ticker, address] = symbol.split('-') as [string, string?];

  return {
    chain,
    ticker,
    symbol,
    address,
    isSynthetic: symbol.includes('/'),
    isGasAsset: isGasAsset({ chain, symbol }),
  };
};

export class AssetValue extends SwapKitNumber {
  address?: string;
  chain: Chain;
  isSynthetic = false;
  isGasAsset = false;
  symbol: string;
  ticker: string;
  value = 0;

  constructor(params: Params) {
    super({ decimal: params.decimal, value: params.value });

    const identifier =
      'identifier' in params ? params.identifier : `${params.chain}.${params.symbol}`;
    const assetInfo = getAssetInfo(identifier);

    this.chain = assetInfo.chain;
    this.ticker = assetInfo.ticker;
    this.symbol = assetInfo.symbol;
    this.address = assetInfo.address;
    this.isSynthetic = assetInfo.isSynthetic;
    this.isGasAsset = assetInfo.isGasAsset;
  }

  /**
   * Create AssetValue from string
   * @param assetString string in format of `CHAIN.TICKER-ADDRESS`
   * @param value asset amount in number or string
   */
  static async fromString(assetString: string, value: number | string = 0) {
    const decimal = await new Promise<number>((resolve) => resolve(18));

    return new AssetValue({ decimal, value, identifier: assetString });
  }

  get assetValue() {
    return `${this.value} ${this.ticker}`;
  }
}
