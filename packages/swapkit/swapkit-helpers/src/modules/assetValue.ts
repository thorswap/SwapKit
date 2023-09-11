import type {
  CoinGeckoList,
  PancakeswapETHList,
  PancakeswapList,
  PangolinList,
  StargateARBList,
  SushiswapList,
  ThorchainList,
  TraderjoeList,
  UniswapList,
  WoofiList,
} from '@thorswap-lib/tokens';
import type { Chain } from '@thorswap-lib/types';
import { BaseDecimal } from '@thorswap-lib/types';

import { getAssetType, getCommonAssetInfo, getDecimal, isGasAsset } from '../helpers/asset.ts';

import { BaseSwapKitNumber, type SwapKitValueType } from './swapKitNumber.ts';

type AssetValueParams = { decimal: number; value: SwapKitValueType } & (
  | { chain: Chain; symbol: string }
  | { identifier: string }
);

type TCTokenNames = (typeof ThorchainList)['tokens'][number]['identifier'];

type TokenNames =
  | TCTokenNames
  | (typeof CoinGeckoList)['tokens'][number]['identifier']
  | (typeof PancakeswapETHList)['tokens'][number]['identifier']
  | (typeof PancakeswapList)['tokens'][number]['identifier']
  | (typeof PangolinList)['tokens'][number]['identifier']
  | (typeof StargateARBList)['tokens'][number]['identifier']
  | (typeof SushiswapList)['tokens'][number]['identifier']
  | (typeof TraderjoeList)['tokens'][number]['identifier']
  | (typeof WoofiList)['tokens'][number]['identifier']
  | (typeof UniswapList)['tokens'][number]['identifier'];

let staticTokensMap: Map<TokenNames, { decimal: number; identifier: string }> | undefined;

const getStaticToken = (identifier: TokenNames) => {
  if (!staticTokensMap) {
    throw new Error('Static assets not loaded, call await AssetValue.loadStaticAssets() first');
  }
  const tokenInfo = staticTokensMap.get(identifier);

  if (!tokenInfo) {
    throw new Error(`Asset ${identifier} not found - check if it's in the tokens package list`);
  }

  return tokenInfo;
};

export class AssetValue extends BaseSwapKitNumber {
  address?: string;
  chain: Chain;
  isSynthetic = false;
  isGasAsset = false;
  symbol: string;
  ticker: string;
  type: ReturnType<typeof getAssetType>;

  constructor(params: AssetValueParams) {
    super(
      params.value instanceof BaseSwapKitNumber
        ? params.value
        : { decimal: params.decimal, value: params.value },
    );

    const identifier =
      'identifier' in params ? params.identifier : `${params.chain}.${params.symbol}`;
    const assetInfo = getAssetInfo(identifier);

    this.type = getAssetType(assetInfo);
    this.chain = assetInfo.chain;
    this.ticker = assetInfo.ticker;
    this.symbol = assetInfo.symbol;
    this.address = assetInfo.address;
    this.isSynthetic = assetInfo.isSynthetic;
    this.isGasAsset = assetInfo.isGasAsset;
  }

  get assetValue() {
    return `${this.value} ${this.ticker}`;
  }

  toString() {
    return `${this.chain}${this.isSynthetic ? '/' : '.'}${this.symbol}`;
  }

  eq({ chain, symbol }: { chain: Chain; symbol: string }) {
    return this.chain === chain && this.symbol === symbol;
  }

  static async fromIdentifier(
    assetString: `${Chain}.${string}` | `${Chain}/${string}` | `${Chain}.${string}-${string}`,
    value: number | string = 0,
  ) {
    const decimal = await getDecimal(getAssetInfo(assetString));
    return new AssetValue({ decimal, value, identifier: assetString });
  }

  static fromIdentifierSync(identifier: TokenNames, value: number | string = 0) {
    const tokenInfo = getStaticToken(identifier);

    return new AssetValue({ ...tokenInfo, value });
  }

  static fromString(assetString: 'ETH.THOR' | 'ETH.vTHOR' | Chain, value: number | string = 0) {
    return new AssetValue({ value, ...getCommonAssetInfo(assetString) });
  }

  static async fromTCQuote(identifier: TCTokenNames, value: number | string = 0) {
    const decimal = await getDecimal(getAssetInfo(identifier));
    const shiftedValue = this.shiftDecimals({ value, from: BaseDecimal.THOR, to: decimal });

    return new AssetValue({ value: shiftedValue, identifier, decimal });
  }

  static fromTCQuoteStatic(identifier: TCTokenNames, value: number | string = 0) {
    const tokenInfo = getStaticToken(identifier);
    const shiftedValue = this.shiftDecimals({
      value,
      from: BaseDecimal.THOR,
      to: tokenInfo.decimal,
    });

    return new AssetValue({ ...tokenInfo, value: shiftedValue });
  }

  static async loadStaticAssets() {
    return new Promise<{ ok: true } | { ok: false; message: string; error: any }>(
      async (resolve, reject) => {
        try {
          const tokensPackage = await import('@thorswap-lib/tokens');
          const tokensMap = Object.values(tokensPackage).reduce((acc, { tokens }) => {
            tokens.forEach(({ identifier, chain, ...rest }) => {
              const decimal = 'decimals' in rest ? rest.decimals : BaseDecimal[chain];

              acc.set(identifier as TokenNames, { identifier, decimal });
            });

            return acc;
          }, new Map<TokenNames, { decimal: number; identifier: string }>());

          staticTokensMap = tokensMap;

          resolve({ ok: true });
        } catch (error) {
          console.error(error);
          reject({
            ok: false,
            error,
            message:
              "Couldn't load static assets. Ensure you have installed @thorswap-lib/tokens package",
          });
        }
      },
    );
  }
}

const getAssetInfo = (identifier: string) => {
  const isSynthetic = identifier.includes('/');
  const [chain, symbol] = identifier.split(isSynthetic ? '/' : '.') as [Chain, string];
  const [ticker, address] = symbol.split('-') as [string, string?];

  return {
    chain,
    ticker,
    symbol,
    address,
    isSynthetic,
    isGasAsset: isGasAsset({ chain, symbol }),
  };
};
